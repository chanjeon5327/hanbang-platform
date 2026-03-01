import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

/**
 * POST /api/admin/retry-invest
 * body: { payment_id }
 * rpc_invest_and_notify_from_payment(payment_id) 호출
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const paymentId = body.payment_id ?? body.paymentId;

    if (!paymentId) {
      return NextResponse.json({ success: false, error: "payment_id required" }, { status: 400 });
    }

    const admin = getAdminSupabase();
    const { data, error } = await admin.rpc("rpc_invest_and_notify_from_payment", {
      p_payment_id: paymentId,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const result = data as { ok?: boolean; order_id?: string; idempotent?: boolean };
    return NextResponse.json({
      success: result?.ok ?? true,
      order_id: result?.order_id,
      idempotent: result?.idempotent,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
