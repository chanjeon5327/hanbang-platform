import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * POST /api/orders/place
 * [PG] payment_method=pg: order? ??(PAYMENT_REQUESTED), request?confirm ??
 * [??] payment_method ??: rpc_invest_and_notify ?? ??
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
      { ok: false, error: "AUTH_ERROR", debug: authError.message },
      { status: 401 }
    );
    }

    const user = authData?.user;
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", debug: "???? ?????." },
        { status: 401 }
      );
    }

    let body: { product_id?: string; content_id?: string; amount?: unknown; idempotency_key?: string; payment_method?: string };
    try {
      body = await req.json();
    } catch (parseErr) {
      const msg = parseErr instanceof Error ? parseErr.message : "Invalid JSON body";
      return NextResponse.json(
        { error: "INVALID_JSON", debug: msg },
        { status: 400 }
      );
    }

    const contentId = body.content_id ?? body.product_id;
    const amountPositive = toPositiveAmount(body.amount);
    const usePg = body.payment_method === "pg";

    if (!contentId || typeof contentId !== "string" || contentId.trim() === "") {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", debug: "content_id or product_id is required (non-empty string)" },
        { status: 400 }
      );
    }

    if (amountPositive <= 0) {
      return NextResponse.json(
        { error: "INVALID_PAYLOAD", debug: "amount must be a positive number" },
        { status: 400 }
      );
    }

    if (usePg) {
      const admin = (await import("@/utils/supabase/server")).createAdminClient();
      const { data: order, error: orderErr } = await admin
        .from("orders")
        .insert({
          user_id: user.id,
          content_id: contentId.trim(),
          status: "PAYMENT_REQUESTED",
          total_amount_krw: amountPositive,
          quantity: 1,
          type: "BUY",
          order_type: "MARKET",
          price: amountPositive,
        } as Record<string, unknown>)
        .select("id")
        .single();
      if (orderErr || !order?.id) {
        return NextResponse.json(
          { error: "ORDER_CREATE_FAILED", debug: orderErr?.message },
          { status: 500 }
        );
      }
      return NextResponse.json({
        ok: true,
        success: true,
        order_id: order.id,
        data: { order_id: order.id },
      });
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
        { error: "INSUFFICIENT_FUNDS", debug: "?? ??" },
        { status: 400 }
      );
    }

    // ACTIVE + KYC ?? ??
    const { data: profile } = await (supabase as any).from("profiles").select("status").eq("id", user.id).single();
    if (profile?.status !== "ACTIVE") {
      return NextResponse.json({ error: "STATUS_REQUIRED", debug: "????? KYC ? ???? ??????." }, { status: 403 });
    }
    try {
      const { data: invProfile } = await (supabase as any).from("investor_profiles").select("investment_limit, kyc_status").eq("user_id", user.id).single();
      const limit = Number(invProfile?.investment_limit ?? 50000000);
      const kyc = invProfile?.kyc_status ?? "PENDING";
      if (kyc !== "APPROVED") {
        return NextResponse.json({ error: "KYC_REQUIRED", debug: "KYC ??? ?????." }, { status: 403 });
      }
      const { data: totalInv } = await (supabase as any).from("ledger_entries").select("amount").eq("user_id", user.id).eq("entry_type", "CASH_DEBIT");
      const invested = (totalInv ?? []).reduce((s: number, r: { amount?: number }) => s + Math.abs(Number(r.amount ?? 0)), 0);
      if (invested + amountPositive > limit) {
        return NextResponse.json({ error: "INVESTMENT_LIMIT_EXCEEDED", debug: "?? ?? ??" }, { status: 400 });
      }
    } catch {
      /* investor_profiles ??? ? ?? */
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc("rpc_invest_and_notify", {
      p_user_id: user.id,
      p_content_id: contentId.trim(),
      p_amount_krw: amountPositive,
      p_idempotency_key: body.idempotency_key ?? null,
    });

    if (rpcError) {
      const msg = rpcError.message ?? "";
      if (msg.includes("INSUFFICIENT_FUNDS")) {
        return NextResponse.json(
          { error: "INSUFFICIENT_FUNDS", debug: "?? ??" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "INVEST_FAILED", debug: rpcError.message },
        { status: 500 }
      );
    }

    const orderId = (rpcResult as { order_id?: string })?.order_id;
    try {
      await supabase.rpc("rpc_write_financial_audit", {
        p_user_id: user.id,
        p_action: "ORDER_PLACE",
        p_target_type: "order",
        p_target_id: orderId ?? null,
        p_metadata: { content_id: contentId, amount: amountPositive },
      });
    } catch {
      /* audit ?? ? ?? */
    }
    let executed_quantity = amountPositive;
    let remaining_quantity = 0;
    if (orderId) {
      const { data: ord } = await (supabase as any).from("orders").select("quantity, filled_quantity").eq("id", orderId).single();
      const qty = Number(ord?.quantity ?? 0);
      const filled = Number(ord?.filled_quantity ?? qty);
      executed_quantity = filled || amountPositive;
      remaining_quantity = Math.max(0, qty - filled);
    }
    return NextResponse.json({
      ok: true,
      success: true,
      order_id: orderId,
      data: { order_id: orderId, executed_quantity: executed_quantity, remaining_quantity: remaining_quantity },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: "UNKNOWN_ERROR", debug: message },
      { status: 500 }
    );
  }
}
