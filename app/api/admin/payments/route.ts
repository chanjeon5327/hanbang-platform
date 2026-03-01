import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * GET /api/admin/payments - 관리자 전용
 * 최근 100건, status 필터
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const admin = getAdminSupabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let q = admin
      .from("payments")
      .select("id, order_id, user_id, content_id, amount, pg_provider, pg_transaction_id, status, approved_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status) q = q.eq("status", status);

    const { data, error } = await q;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ payments: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
