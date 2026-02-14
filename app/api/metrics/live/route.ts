import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60;

const FALLBACK = { ok: false, live: 0, last_24h_amount: 0, last_1h_count: 0, today_count: 0 };

/**
 * GET /api/metrics/live
 * orders 기반 집계 (INVEST_CONFIRMED 이상만)
 * - last_24h_amount: 최근 24시간 전체 투자 금액
 * - last_1h_count: 최근 1시간 참여 인원
 * - today_count: 오늘 투자 확정 건수
 * 항상 200 반환. 실패 시 FALLBACK.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: rows, error } = await supabase
      .from("orders")
      .select("total_amount_krw, created_at")
      .in("status", ["INVEST_CONFIRMED", "SETTLED", "COMPLETED"])
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      console.error("[metrics/live] supabase error:", error.message);
      return NextResponse.json(FALLBACK, { status: 200 });
    }

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    let last_24h_amount = 0;
    let last_1h_count = 0;
    let today_count = 0;

    for (const r of rows ?? []) {
      const amt = Number(r.total_amount_krw ?? 0);
      const createdAt = new Date(r.created_at ?? 0).getTime();

      if (createdAt >= now - 24 * 60 * 60 * 1000) {
        last_24h_amount += amt;
      }
      if (createdAt >= oneHourAgo) {
        last_1h_count += 1;
      }
      if (createdAt >= todayStart.getTime()) {
        today_count += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      last_24h_amount,
      last_1h_count,
      today_count,
    }, { status: 200 });
  } catch (e) {
    console.error("[metrics/live] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
