import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { requireKycApproved } from "@/lib/kyc/requireKycApproved";

function toPositiveNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

/**
 * POST /api/orders/sell
 * - 부분 매도: content_id, quantity
 * - ASSET_DEBIT + CASH_CREDIT 원장 반영
 */
export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", debug: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const user = authData.user;

    // KYC is always required — DEMO_TRADING must not bypass financial auth checks.
    const kycCheck = await requireKycApproved(supabase, user.id);
    if (!kycCheck.approved) {
      return kycCheck.response;
    }

    let body: { product_id?: string; content_id?: string; quantity?: unknown; idempotency_key?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "INVALID_JSON", debug: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const contentId = (body.content_id ?? body.product_id)?.trim();
    const quantity = toPositiveNumber(body.quantity);
    const idempotencyKey = body.idempotency_key ?? null;

    if (!contentId || quantity <= 0) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", debug: "content_id와 quantity(>0)가 필요합니다." },
        { status: 400 }
      );
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc("rpc_sell_content", {
      p_user_id: user.id,
      p_content_id: contentId,
      p_quantity: quantity,
      p_idempotency_key: idempotencyKey,
    });

    if (rpcError) {
      const msg = rpcError.message ?? "";
      if (msg.includes("INSUFFICIENT_ASSETS")) {
        return NextResponse.json(
          { error: "INSUFFICIENT_ASSETS", debug: "보유 수량이 부족합니다." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "SELL_FAILED", debug: rpcError.message },
        { status: 500 }
      );
    }

    const orderId = (rpcResult as { order_id?: string })?.order_id;
    return NextResponse.json({ success: true, order_id: orderId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", debug: message },
      { status: 500 }
    );
  }
}
