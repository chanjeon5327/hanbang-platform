/**
 * ============================================================================
 * GET /api/dashboard/pnl — 실시간 손익(PnL) 조회 API
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수 사항]
 * 1. 투자자별 실시간 미실현 손익 산정
 * 2. 포지션 테이블 기반 정확한 평균단가·실현손익 제공
 * 3. Long-Only 기준 미실현 손익 수식:
 *    unrealized_pnl = (current_price - avg_price) × quantity
 *
 * 데이터 흐름:
 * - positions 테이블: 평균단가(avg_price), 보유수량(quantity), 실현손익(realized_pnl)
 * - content_items 테이블: 현재 시세(share_price_usd)
 * - v_item_last_price 뷰: 최근 체결가(price_krw)
 * - ledger_entries: 현금 잔고 계산
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

import type { PnlResponse, PnlPositionItem } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

/** 고정 환율 (USD → KRW). 실서비스에서는 실시간 환율 API 연동 권장 */
const FX_RATE_USD_KRW = 1350;

export async function GET() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    await requireActiveUser(user.id);
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  /* ──────────────────────────────────────────
   * 1. 포지션 조회 (positions 테이블)
   * ────────────────────────────────────────── */
  const { data: positionRows, error: posErr } = await supabase
    .from("positions")
    .select("asset_id, quantity, avg_price, total_cost, realized_pnl")
    .eq("user_id", user.id)
    .gt("quantity", 0);

  if (posErr) {
    return NextResponse.json(
      { error: "POSITION_QUERY_FAILED", debug: posErr.message },
      { status: 500 },
    );
  }

  const positions = positionRows ?? [];
  const assetIds = positions.map((p) => p.asset_id as string);

  /* ──────────────────────────────────────────
   * 2. 자산 정보 조회 (콘텐츠 제목 + 기준가)
   * ────────────────────────────────────────── */
  let itemMap: Record<string, { title: string; share_price_usd: number }> = {};
  if (assetIds.length > 0) {
    const { data: items } = await supabase
      .from("content_items")
      .select("id, title, share_price_usd")
      .in("id", assetIds);

    (items ?? []).forEach((item: { id: string; title: string; share_price_usd: number }) => {
      itemMap[item.id] = { title: item.title, share_price_usd: item.share_price_usd };
    });
  }

  /* ──────────────────────────────────────────
   * 3. 최근 체결가 조회 (거래소 시세 반영)
   * ────────────────────────────────────────── */
  let lastPriceMap: Record<string, number> = {};
  if (assetIds.length > 0) {
    try {
      const { data: prices } = await (supabase as ReturnType<typeof Object>)
        .from("v_item_last_price")
        .select("item_id, price_krw")
        .in("item_id", assetIds);

      (prices ?? []).forEach((p: { item_id: string; price_krw: number }) => {
        lastPriceMap[p.item_id] = p.price_krw;
      });
    } catch {
      /* v_item_last_price 뷰가 없는 경우 기본가 사용 */
    }
  }

  /* ──────────────────────────────────────────
   * 4. 현금 잔고 계산 (원장 기반)
   * ────────────────────────────────────────── */
  const { data: cashEntries } = await supabase
    .from("ledger_entries")
    .select("entry_type, amount")
    .eq("user_id", user.id);

  let cashBalance = 0;
  (cashEntries ?? []).forEach((r: { entry_type: string; amount: number }) => {
    if (r.entry_type === "CASH_CREDIT") cashBalance += Math.abs(Number(r.amount ?? 0));
    if (r.entry_type === "CASH_DEBIT") cashBalance -= Math.abs(Number(r.amount ?? 0));
  });

  /* ──────────────────────────────────────────
   * 5. PnL 계산
   * Long-Only 기준:
   *   unrealized_pnl = (current_price - avg_price) × quantity
   * ────────────────────────────────────────── */
  let totalUnrealizedPnl = 0;
  let totalRealizedPnl = 0;
  let totalAssetValue = 0;

  const pnlPositions: PnlPositionItem[] = positions.map((pos) => {
    const assetId = pos.asset_id as string;
    const qty = Number(pos.quantity ?? 0);
    const avgPrice = Number(pos.avg_price ?? 0);
    const realizedPnl = Number(pos.realized_pnl ?? 0);

    const item = itemMap[assetId];
    const title = item?.title ?? "수익권";

    /* 현재가 결정 우선순위: 최근체결가 > 콘텐츠기준가 > 평균매수가 */
    const currentPrice =
      lastPriceMap[assetId] ??
      (item?.share_price_usd ? item.share_price_usd * FX_RATE_USD_KRW : avgPrice);

    const unrealizedPnl = (currentPrice - avgPrice) * qty;
    const unrealizedRate = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

    totalUnrealizedPnl += unrealizedPnl;
    totalRealizedPnl += realizedPnl;
    totalAssetValue += currentPrice * qty;

    return {
      asset_id: assetId,
      title,
      quantity: qty,
      avg_price: Math.round(avgPrice),
      current_price: Math.round(currentPrice),
      unrealized_pnl: Math.round(unrealizedPnl),
      unrealized_rate: Math.round(unrealizedRate * 100) / 100,
      realized_pnl: Math.round(realizedPnl),
    };
  });

  /* ──────────────────────────────────────────
   * 6. 응답 반환
   * ────────────────────────────────────────── */
  const response: PnlResponse = {
    cash_balance: Math.round(cashBalance),
    positions: pnlPositions,
    total_unrealized_pnl: Math.round(totalUnrealizedPnl),
    total_realized_pnl: Math.round(totalRealizedPnl),
    total_portfolio_value: Math.round(cashBalance + totalAssetValue),
  };

  return NextResponse.json(response);
}
