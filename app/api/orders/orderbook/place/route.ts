import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { retryOnLockBusy, isLockBusyInResult } from "@/lib/lock/retryOnLockBusy";

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

function isLockBusyError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  return msg.includes("lock_busy");
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
    const idempotencyKey = body.idempotency_key ?? null;

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

    let result: { ok?: boolean; error?: string; order_id?: string; match_result?: { note?: string; matched_count?: number } } | null = null;

    try {
      result = await retryOnLockBusy(
        async () => {
          const { data, error } = await supabase.rpc("rpc_place_orderbook_order", {
            p_user_id: user.id,
            p_item_id: itemId,
            p_side: side,
            p_price_usd: priceUsd,
            p_quantity: quantity,
            p_price_krw: priceKrw,
          });
          if (error) throw error;
          return data as typeof result;
        },
        { retries: 2, baseDelayMs: 80, jitterMs: 120 }
      );
    } catch (e) {
      if (isLockBusyError(e)) {
        return NextResponse.json({ ok: false, code: "LOCK_BUSY", error: "LOCK_BUSY" }, { status: 409 });
      }
      const msg = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({ error: "ORDER_FAILED", debug: msg }, { status: 500 });
    }

    if (result?.ok === false) {
      return NextResponse.json({ error: result.error ?? "ORDER_FAILED" }, { status: 400 });
    }

    if (isLockBusyInResult(result)) {
      try {
        const matchResult = await retryOnLockBusy(
          async () => {
            const { data, error } = await supabase.rpc("rpc_match_orders", { p_item_id: itemId });
            if (error) throw error;
            const m = data as { note?: string; matched_count?: number };
            if (m?.note === "LOCK_BUSY") {
              throw Object.assign(new Error("LOCK_BUSY"), { code: "LOCK_BUSY" });
            }
            return m;
          },
          { retries: 2, baseDelayMs: 80, jitterMs: 120 }
        );
        if (result) result.match_result = matchResult;
      } catch (e) {
        if (isLockBusyError(e)) {
          return NextResponse.json({ ok: false, code: "LOCK_BUSY", error: "LOCK_BUSY" }, { status: 409 });
        }
      }
    }

    try {
      await supabase.rpc("rpc_write_financial_audit", {
        p_user_id: user.id,
        p_action: "ORDERBOOK_PLACE",
        p_target_type: "orderbook_order",
        p_target_id: result?.order_id ?? null,
        p_metadata: { item_id: itemId, side, price_usd: priceUsd, quantity, idempotency_key: idempotencyKey },
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
    if (isLockBusyError(e)) {
      return NextResponse.json({ ok: false, code: "LOCK_BUSY", error: "LOCK_BUSY" }, { status: 409 });
    }
    return NextResponse.json({ error: "UNKNOWN_ERROR", debug: msg }, { status: 500 });
  }
}
