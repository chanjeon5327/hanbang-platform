/**
 * POST /api/exchange/cancel — 거래소 주문 취소 (인증 필수)
 *
 * body: { order_id }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    let body: { order_id?: string };
    try { body = await req.json(); } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    if (!body.order_id) {
      return NextResponse.json({ ok: false, error: "MISSING_ORDER_ID" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("rpc_exchange_cancel_order", {
      p_user_id: user.id,
      p_order_id: body.order_id,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const result = data as { ok: boolean; error?: string };
    if (!result?.ok) {
      return NextResponse.json({ ok: false, error: result?.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "UNKNOWN" },
      { status: 500 },
    );
  }
}
