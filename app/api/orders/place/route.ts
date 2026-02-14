import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * @deprecated POST /api/orders/place - 실결제 없이 즉시 투자 (잔액 차감)
 * 신규: POST /api/payments/request → PG redirect → /api/payments/confirm
 * 이 API는 샌드박스/테스트용으로만 유지
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

    let body: { product_id?: string; content_id?: string; amount?: unknown; idempotency_key?: string };
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
          { error: "INSUFFICIENT_FUNDS", debug: "잔액 부족" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "INVEST_FAILED", debug: rpcError.message },
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
