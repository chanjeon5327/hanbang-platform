/**
 * ============================================================================
 * GET /api/dashboard/dividends — 배당 대시보드 API
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수]
 * - 투자자별 배당 수령 내역의 투명한 제공
 * - 원장(ledger_entries) 기반 정확한 배당 집계
 * - 최근 12개월 월별 집계 + 누적 합계
 * - 최근 분배 내역 (revenue_distributions)
 *
 * 반환: { this_month, total_cumulative, monthly[], recent_distributions[] }
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

import type { DividendDashboardResponse } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

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
   * 1. 원장에서 배당 관련 CASH_CREDIT 조회
   *    (memo가 'DIVIDEND' 또는 '수익분배 배당금')
   * ────────────────────────────────────────── */
  const { data: dividendEntries } = await supabase
    .from("ledger_entries")
    .select("amount, created_at, memo")
    .eq("user_id", user.id)
    .eq("entry_type", "CASH_CREDIT");

  const allDividends = (dividendEntries ?? []).filter(
    (r: { memo: string | null }) =>
      r.memo === "DIVIDEND" || r.memo === "수익분배 배당금",
  );

  /* ──────────────────────────────────────────
   * 2. 이번 달 / 누적 / 월별 집계
   * ────────────────────────────────────────── */
  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  let totalCumulative = 0;
  let thisMonth = 0;
  const byMonth: Record<string, number> = {};

  allDividends.forEach((r: { amount: number; created_at: string }) => {
    const amt = Math.abs(Number(r.amount ?? 0));
    totalCumulative += amt;

    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (key === thisMonthKey) thisMonth += amt;
    if (d >= twelveMonthsAgo) {
      byMonth[key] = (byMonth[key] ?? 0) + amt;
    }
  });

  /* 12개월 월별 데이터 (빈 달도 0으로 채움) */
  const monthly: Array<{ month: string; amount: number }> = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(twelveMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.push({ month: key, amount: Math.round(byMonth[key] ?? 0) });
  }

  /* ──────────────────────────────────────────
   * 3. 최근 분배 내역 (revenue_distributions)
   * ────────────────────────────────────────── */
  let recentDistributions: Array<{
    event_id: string;
    content_id: string;
    amount: number;
    share_ratio: number;
    created_at: string;
  }> = [];

  try {
    const { data: distRows } = await supabase
      .from("revenue_distributions")
      .select("event_id, amount, share_ratio, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (distRows && distRows.length > 0) {
      const eventIds = [...new Set(distRows.map((r: { event_id: string }) => r.event_id))];
      let eventContentMap: Record<string, string> = {};

      try {
        const { data: events } = await (supabase as ReturnType<typeof Object>)
          .from("revenue_events")
          .select("id, content_id")
          .in("id", eventIds);

        (events ?? []).forEach((e: { id: string; content_id: string }) => {
          eventContentMap[e.id] = e.content_id;
        });
      } catch {
        /* revenue_events 조회 실패 시 무시 */
      }

      recentDistributions = distRows.map(
        (r: { event_id: string; amount: number; share_ratio: number; created_at: string }) => ({
          event_id: r.event_id,
          content_id: eventContentMap[r.event_id] ?? "",
          amount: Math.round(Number(r.amount ?? 0)),
          share_ratio: Number(r.share_ratio ?? 0),
          created_at: r.created_at,
        }),
      );
    }
  } catch {
    /* revenue_distributions 테이블 미존재 시 빈 배열 */
  }

  /* ──────────────────────────────────────────
   * 4. 응답
   * ────────────────────────────────────────── */
  const response: DividendDashboardResponse = {
    this_month: Math.round(thisMonth),
    total_cumulative: Math.round(totalCumulative),
    monthly,
    recent_distributions: recentDistributions,
  };

  return NextResponse.json(response);
}
