/**
 * /api/admin/corporate-actions/dividends — 배당 관리 API (관리자)
 *
 * GET  → 배당 액션 목록
 * POST → body.action으로 분기:
 *   - "create"   → 배당 액션 생성
 *   - "snapshot"  → 보유자 스냅샷
 *   - "pay"       → 배당 지급
 */
import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const admin = getAdminSupabase();
    const { data, error } = await admin
      .from("corporate_actions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, actions: data ?? [] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "UNKNOWN" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin();
    const admin = getAdminSupabase();

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const action = String(body.action ?? "create");

    if (action === "create") {
      const { data, error } = await admin
        .from("corporate_actions")
        .insert({
          asset_id: body.asset_id,
          action_type: "DIVIDEND",
          ex_date: body.ex_date,
          record_date: body.record_date,
          pay_date: body.pay_date,
          amount_per_share: body.amount_per_share,
          created_by: adminUser.id,
        })
        .select("id, asset_id, status, amount_per_share")
        .single();
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, corporate_action: data });
    }

    if (action === "snapshot") {
      const { data, error } = await admin.rpc("rpc_snapshot_dividend_holders", {
        p_action_id: body.action_id,
      });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      return NextResponse.json(data as Record<string, unknown>);
    }

    if (action === "pay") {
      const { data, error } = await admin.rpc("rpc_pay_dividend", {
        p_action_id: body.action_id,
      });
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      return NextResponse.json(data as Record<string, unknown>);
    }

    return NextResponse.json({ ok: false, error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "UNKNOWN" }, { status: 500 });
  }
}
