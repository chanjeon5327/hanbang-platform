/**
 * POST /api/exchange/place — 거래소 주문 배치 (인증 필수)
 *
 * body: { asset_id, side, order_type, price?, quantity?, amount_max?, idempotency_key? }
 */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { requireKycApproved } from "@/lib/kyc/requireKycApproved";
import type { ExchangePlaceRequest, ExchangePlaceResult } from "@/lib/types/financial";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const kycCheck = await requireKycApproved(supabase, user.id);
    if (!kycCheck.approved) {
      return kycCheck.response;
    }

    let body: ExchangePlaceRequest;
    try { body = await req.json(); } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    if (!body.asset_id) {
      return NextResponse.json({ ok: false, error: "MISSING_ASSET_ID" }, { status: 400 });
    }

    const { data, error } = await supabase.rpc("rpc_exchange_place_order", {
      p_user_id: user.id,
      p_asset_id: body.asset_id,
      p_side: body.side ?? "BUY",
      p_order_type: body.order_type ?? "LIMIT",
      p_price: body.price ?? null,
      p_quantity: body.quantity ?? null,
      p_amount_max: body.amount_max ?? null,
      p_idempotency_key: body.idempotency_key ?? null,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const result = data as ExchangePlaceResult;
    if (!result?.ok) {
      const statusMap: Record<string, number> = {
        INSUFFICIENT_FUNDS: 400, INSUFFICIENT_ASSETS: 400,
        INVALID_SIDE: 400, INVALID_ORDER_TYPE: 400,
        PRICE_REQUIRED_FOR_LIMIT: 400, QUANTITY_REQUIRED_FOR_LIMIT: 400,
        AMOUNT_MAX_REQUIRED_FOR_MARKET_BUY: 400, QUANTITY_REQUIRED_FOR_MARKET_SELL: 400,
      };
      return NextResponse.json(
        { ok: false, error: result?.error },
        { status: statusMap[result?.error ?? ""] ?? 500 },
      );
    }

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "UNKNOWN" },
      { status: 500 },
    );
  }
}
