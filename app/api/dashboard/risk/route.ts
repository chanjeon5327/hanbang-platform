/**
 * ============================================================================
 * GET /api/dashboard/risk — 리스크 지표 조회 API (MDD + Rolling Return)
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수 사항]
 * 1. 투자자별 MDD(최대 낙폭) 산정 및 제공
 *    - MDD = (저점 equity - 고점 equity) / 고점 equity × 100
 * 2. Rolling 30일/90일 수익률 제공
 * 3. 일별 자산가치(equity) 추이 제공 (최근 30일)
 * 4. 투자자 리스크 고지 의무 이행을 위한 데이터 기반
 *
 * 데이터 소스:
 * - portfolio_daily_snapshot: 일별 equity 기록
 * - v_portfolio_mdd: MDD 산정 뷰
 * - v_portfolio_rolling_returns: Rolling Return 산정 뷰
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireActiveUser } from "@/lib/auth/requireActiveUser";

import type { RiskResponse, MddResult, RollingReturn } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
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
   * 1. MDD(최대 낙폭) 조회
   * ────────────────────────────────────────── */
  let mdd: MddResult | null = null;
  try {
    const { data: mddRows } = await (supabase as ReturnType<typeof Object>)
      .from("v_portfolio_mdd")
      .select("user_id, mdd_pct, peak_date, trough_date, peak_equity, trough_equity")
      .eq("user_id", user.id)
      .limit(1);

    if (mddRows && mddRows.length > 0) {
      const row = mddRows[0] as {
        user_id: string;
        mdd_pct: number;
        peak_date: string;
        trough_date: string;
        peak_equity: number;
        trough_equity: number;
      };
      mdd = {
        user_id: row.user_id,
        mdd_pct: Math.round(Number(row.mdd_pct) * 100) / 100,
        peak_date: row.peak_date,
        trough_date: row.trough_date,
        peak_equity: Math.round(Number(row.peak_equity)),
        trough_equity: Math.round(Number(row.trough_equity)),
      };
    }
  } catch {
    /* v_portfolio_mdd 뷰가 아직 없거나 데이터 부족 시 null 반환 */
  }

  /* ──────────────────────────────────────────
   * 2. Rolling 30일/90일 수익률 조회
   * ────────────────────────────────────────── */
  let rollingReturns: RollingReturn = {
    user_id: user.id,
    return_30d: null,
    return_90d: null,
    current_equity: 0,
  };

  try {
    const { data: returnRows } = await (supabase as ReturnType<typeof Object>)
      .from("v_portfolio_rolling_returns")
      .select("user_id, current_equity, return_30d, return_90d")
      .eq("user_id", user.id)
      .limit(1);

    if (returnRows && returnRows.length > 0) {
      const row = returnRows[0] as {
        user_id: string;
        current_equity: number;
        return_30d: number | null;
        return_90d: number | null;
      };
      rollingReturns = {
        user_id: row.user_id,
        return_30d: row.return_30d != null ? Math.round(Number(row.return_30d) * 100) / 100 : null,
        return_90d: row.return_90d != null ? Math.round(Number(row.return_90d) * 100) / 100 : null,
        current_equity: Math.round(Number(row.current_equity)),
      };
    }
  } catch {
    /* v_portfolio_rolling_returns 뷰 미존재 시 기본값 반환 */
  }

  /* ──────────────────────────────────────────
   * 3. 최근 30일 일별 equity 추이
   * ────────────────────────────────────────── */
  let equityHistory: Array<{ date: string; equity: number }> = [];
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

    const { data: snapshots } = await supabase
      .from("portfolio_daily_snapshot")
      .select("snapshot_date, equity")
      .eq("user_id", user.id)
      .gte("snapshot_date", dateStr)
      .order("snapshot_date", { ascending: true });

    equityHistory = (snapshots ?? []).map(
      (s: { snapshot_date: string; equity: number }) => ({
        date: s.snapshot_date,
        equity: Math.round(Number(s.equity)),
      }),
    );
  } catch {
    /* 스냅샷 데이터 없을 시 빈 배열 반환 */
  }

  /* ──────────────────────────────────────────
   * 4. 응답 반환
   * ────────────────────────────────────────── */
  const response: RiskResponse = {
    mdd,
    rolling_returns: rollingReturns,
    equity_history: equityHistory,
  };

  return NextResponse.json(response);
}
