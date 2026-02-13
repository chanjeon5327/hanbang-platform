import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

/**
 * 잔액 계산: CASH_CREDIT(+) - CASH_DEBIT(-)
 */
function computeBalance(rows: { entry_type: string; amount: number }[]): number {
  let balance = 0;
  for (const r of rows) {
    const amt = Number(r.amount) || 0;
    if (r.entry_type === "CASH_CREDIT") balance += amt;
    if (r.entry_type === "CASH_DEBIT") balance -= Math.abs(amt);
  }
  return balance;
}

function toPositiveAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json(
        { error: "AUTH_ERROR", debug: authError.message },
        { status: 401 }
      );
    }

    const user = authData?.user;
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", debug: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    let body: { product_id?: string; amount?: unknown };
    try {
      body = await req.json();
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : "Invalid JSON body";
      return NextResponse.json(
        { error: "INVALID_JSON", debug: msg },
        { status: 400 }
      );
    }

    const { product_id, amount } = body;
    const amountPositive = toPositiveAmount(amount);

    if (!product_id || typeof product_id !== "string" || product_id.trim() === "") {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", debug: "product_id is required (non-empty string)" },
        { status: 400 }
      );
    }

    if (amountPositive <= 0) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", debug: "amount must be a positive number" },
        { status: 400 }
      );
    }

    const { data: ledgerRows, error: ledgerSelectError } = await supabase
      .from("ledger_entries")
      .select("entry_type, amount")
      .eq("user_id", user.id);

    if (ledgerSelectError) {
      return NextResponse.json(
        { error: "LEDGER_SELECT_FAILED", debug: ledgerSelectError.message },
        { status: 500 }
      );
    }

    const balance = computeBalance(ledgerRows ?? []);

    if (balance < amountPositive) {
      return NextResponse.json(
        { error: "INSUFFICIENT_FUNDS", debug: "잔액 부족" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const orderPayload = {
      user_id: user.id,
      product_id: product_id.trim(),
      type: "BUY" as const,
      order_type: "MARKET" as const,
      price: amountPositive,
      quantity: 1,
      filled_quantity: 1,
      status: "COMPLETED" as const,
      completed_at: nowIso,
      ledger_posted_at: nowIso,
    };

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert(orderPayload)
      .select("id")
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: "ORDER_INSERT_FAILED", debug: orderError.message },
        { status: 500 }
      );
    }

    if (!order?.id) {
      return NextResponse.json(
        { error: "ORDER_INSERT_FAILED", debug: "Order insert returned no id" },
        { status: 500 }
      );
    }

    const { error: ledgerError } = await supabase.rpc("rpc_post_ledger_for_order", {
      p_order_id: order.id,
      p_user_id: user.id,
      p_amount_krw: amountPositive,
      p_product_id: product_id.trim(),
      p_quantity: 1,
    });

    if (ledgerError) {
      return NextResponse.json(
        { error: "LEDGER_INSERT_FAILED", debug: ledgerError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, order_id: order.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", debug: message },
      { status: 500 }
    );
  }
}
