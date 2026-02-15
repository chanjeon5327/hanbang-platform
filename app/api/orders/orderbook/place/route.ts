import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

function computeBalance(rows: { entry_type: string; amount: number }[]): number {
  let balance = 0;
  for (const r of rows) {
    const amt = Number(r.amount) || 0;
    if (r.entry_type === "CASH_CREDIT") balance += amt;
    if (r.entry_type === "CASH_DEBIT") balance -= Math.abs(amt);
  }
  return balance;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const itemId = body.item_id ?? body.content_id ?? body.product_id;
    const side = (body.side ?? "bid").toString().toLowerCase();
    const priceUsd = Number(body.price_usd ?? body.price ?? 10);
    const quantity = Number(body.quantity ?? 1);
    const priceKrw = body.price_krw != null ? Number(body.price_krw) : null;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json({ error: "INVALID_PAYLOAD", debug: "item_id required" }, { status: 400 });
    }
    if (side !== "bid" && side !== "ask") {
      return NextResponse.json({ error: "INVALID_PAYLOAD", debug: "side must be bid or ask" }, { status: 400 });
    }
    if (quantity <= 0 || priceUsd <= 0) {
      return NextResponse.json({ error: "INVALID_PAYLOAD", debug: "quantity and price must be positive" }, { status: 400 });
    }

    if (side === "bid") {
      const amountKrw = Math.round(quantity * (priceKrw ?? priceUsd * 1350));
      const { data: ledgerRows } = await supabase.from("ledger_entries").select("entry_type, amount").eq("user_id", user.id);
      const balance = computeBalance(ledgerRows ?? []);
      if (balance < amountKrw) {
        return NextResponse.json({ error: "INSUFFICIENT_FUNDS", debug: "잔액 부족" }, { status: 400 });
      }
    }

    const { data, error } = await supabase.rpc("rpc_place_orderbook_order", {
      p_user_id: user.id,
      p_item_id: itemId,
      p_side: side,
      p_price_usd: priceUsd,
      p_quantity: quantity,
      p_price_krw: priceKrw,
    });

    if (error) {
      return NextResponse.json({ error: "ORDER_FAILED", debug: error.message }, { status: 500 });
    }

    const result = data as { ok?: boolean; error?: string; order_id?: string; match_result?: { matched_count?: number } };
    if (result?.ok === false) {
      return NextResponse.json({ error: result.error ?? "ORDER_FAILED" }, { status: 400 });
    }

    try {
      await (supabase as any).from("financial_audit_logs").insert({
        user_id: user.id,
        action: "ORDERBOOK_PLACE",
        target_type: "orderbook_order",
        target_id: result?.order_id ?? null,
        metadata: { item_id: itemId, side, price_usd: priceUsd, quantity },
      });
    } catch {
      /* audit 실패 시 무시 */
    }

    return NextResponse.json({
      success: true,
      order_id: result?.order_id,
      matched_count: result?.match_result?.matched_count ?? 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: "UNKNOWN_ERROR", debug: msg }, { status: 500 });
  }
}
