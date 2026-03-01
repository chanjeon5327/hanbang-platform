/**
 * ============================================================================
 * /api/admin/revenue/events — 수익 이벤트 관리 API (관리자 전용)
 * ============================================================================
 *
 * POST: 새 수익 이벤트 생성
 * GET:  수익 이벤트 목록 조회 (최근 50건)
 *
 * [금융감독원 전자금융업 감독규정 준수]
 * - 수익 발생 기록의 추적가능성 확보
 * - 관리자 인증 필수, 생성자 ID 기록
 *
 * ============================================================================
 */

import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

import type { RevenueEventCreateRequest } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

/** POST — 수익 이벤트 생성 */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    let body: RevenueEventCreateRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    if (!body.content_id || typeof body.content_id !== "string") {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", debug: "content_id가 필요합니다." },
        { status: 400 },
      );
    }
    if (!body.net_amount || body.net_amount <= 0) {
      return NextResponse.json(
        { ok: false, error: "INVALID_PAYLOAD", debug: "net_amount는 양수여야 합니다." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getAdminSupabase();

    const { data, error } = await supabaseAdmin
      .from("revenue_events")
      .insert({
        content_id: body.content_id,
        gross_amount: body.gross_amount ?? body.net_amount,
        net_amount: body.net_amount,
        occurred_at: body.occurred_at ?? new Date().toISOString(),
        status: "PENDING",
        created_by: admin.id,
      })
      .select("id, content_id, gross_amount, net_amount, status, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, event: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

/** GET — 수익 이벤트 목록 조회 */
export async function GET() {
  try {
    await requireAdmin();

    const supabaseAdmin = getAdminSupabase();

    const { data, error } = await supabaseAdmin
      .from("revenue_events")
      .select("id, content_id, gross_amount, net_amount, currency, status, occurred_at, created_at, created_by")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, events: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
