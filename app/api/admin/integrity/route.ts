import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * GET /api/admin/integrity - v_integrity_check 조회 (관리자 전용)
 */
export async function GET() {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("v_integrity_check")
      .select("content_id, orders_sum, ledger_sum, current_raise");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []).map((r) => ({
      content_id: r.content_id,
      orders_sum: Number(r.orders_sum ?? 0),
      ledger_sum: Number(r.ledger_sum ?? 0),
      current_raise: Number(r.current_raise ?? 0),
    }));

    return NextResponse.json({ items: rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
