/**
 * ============================================================================
 * POST /api/admin/revenue/distribute — 수익분배 실행 API (관리자 전용)
 * ============================================================================
 *
 * 지정된 revenue_event를 해당 콘텐츠 보유자에게 비례 분배합니다.
 *
 * [금융감독원 전자금융업 감독규정 준수]
 * - rpc_distribute_revenue: 원자적 분배 + 원장 기록
 * - advisory lock으로 이중 분배 방지
 * - 멱등성 보장 (event+user unique constraint)
 *
 * 요청: { event_id: string }
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

import type { RevenueDistributeResult } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    let body: { event_id?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    if (!body.event_id || typeof body.event_id !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", debug: "event_id가 필요합니다." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getAdminSupabase();

    const { data, error } = await supabaseAdmin.rpc("rpc_distribute_revenue", {
      p_event_id: body.event_id,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const result = data as RevenueDistributeResult;

    if (!result?.ok) {
      const statusMap: Record<string, number> = {
        EVENT_NOT_FOUND: 404,
        EVENT_ALREADY_PROCESSED: 409,
        NO_HOLDERS: 400,
        ZERO_NET_AMOUNT: 400,
        DUPLICATE_DISTRIBUTION: 409,
      };
      return NextResponse.json(
        { ok: false, error: result?.error },
        { status: statusMap[result?.error ?? ""] ?? 500 },
      );
    }

    /* 감사 로그 (비차단) */
    try {
      await supabaseAdmin.rpc("rpc_write_financial_audit", {
        p_user_id: admin.id,
        p_action: "REVENUE_DISTRIBUTE",
        p_target_type: "revenue_event",
        p_target_id: body.event_id,
        p_metadata: {
          total_distributed: result.total_distributed,
          holder_count: result.holder_count,
        },
      });
    } catch {
      /* 감사 로그 실패는 무시 */
    }

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
