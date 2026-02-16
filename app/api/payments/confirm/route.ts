import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import { logSystem } from "@/lib/systemLog";

const PG_SANDBOX = process.env.PG_SANDBOX === "true";

/**
 * GET/POST /api/payments/confirm
 * [샌드박스] PG_SANDBOX=true 또는 sandbox=1: 즉시 APPROVED → rpc_invest_and_notify_from_payment
 * [실 PG] PG_SANDBOX=false: PG 승인 검증 후 처리 (미구현)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("payment_id");
  const sandbox = searchParams.get("sandbox") === "1";

  if (!paymentId) {
    return NextResponse.redirect(new URL("/market?error=no_payment_id", req.url));
  }

  const admin = createAdminClient();
  const { data: payment, error: payErr } = await admin
    .from("payments")
    .select("id, order_id, user_id, content_id, amount, status")
    .eq("id", paymentId)
    .single();

  if (payErr || !payment) {
    return NextResponse.redirect(new URL("/market?error=payment_not_found", req.url));
  }

  if (payment.status === "PAYMENT_APPROVED" || payment.status === "INVEST_CONFIRMED") {
    return NextResponse.redirect(new URL("/invest/success", req.url));
  }

  const isSandbox = PG_SANDBOX || sandbox;

  if (isSandbox) {
    await admin.from("payments").update({
      status: "PAYMENT_APPROVED",
      approved_at: new Date().toISOString(),
      pg_provider: "SANDBOX",
    }).eq("id", paymentId);

    const { error: rpcErr } = await admin.rpc("rpc_invest_and_notify_from_payment", {
      p_payment_id: paymentId,
    });

    if (rpcErr) {
      await logSystem("RPC_EXCEPTION", {
        route: "/api/payments/confirm",
        payment_id: paymentId,
        error: rpcErr.message,
        code: rpcErr.code,
      });
      return NextResponse.redirect(new URL(`/market/${payment.content_id}?error=invest_failed`, req.url));
    }
  } else {
    return NextResponse.redirect(new URL("/market?error=pg_not_ready", req.url));
  }

    return NextResponse.redirect(new URL("/invest/success", req.url));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const paymentId = body.payment_id ?? body.paymentId;
    const pgTransactionId = body.pg_transaction_id ?? body.transaction_id;

    if (!paymentId) {
      return NextResponse.json({ ok: false, error: "payment_id required" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: payment, error: payErr } = await admin
      .from("payments")
      .select("id, order_id, user_id, content_id, amount, status")
      .eq("id", paymentId)
      .single();

    if (payErr || !payment) {
      return NextResponse.json({ ok: false, error: "PAYMENT_NOT_FOUND" }, { status: 404 });
    }

    if (payment.status === "PAYMENT_APPROVED" || payment.status === "INVEST_CONFIRMED") {
      return NextResponse.json({ ok: true, success: true, idempotent: true, order_id: payment.order_id });
    }

    const isSandbox = PG_SANDBOX;

    if (isSandbox) {
      await admin.from("payments").update({
        status: "PAYMENT_APPROVED",
        approved_at: new Date().toISOString(),
        pg_provider: "SANDBOX",
        pg_transaction_id: pgTransactionId || `sandbox_${paymentId}`,
      }).eq("id", paymentId);

      const { data: rpcResult, error: rpcErr } = await admin.rpc("rpc_invest_and_notify_from_payment", {
        p_payment_id: paymentId,
      });

      if (rpcErr) {
        await logSystem("RPC_EXCEPTION", {
          route: "/api/payments/confirm",
          payment_id: paymentId,
          error: rpcErr.message,
          code: rpcErr.code,
        });
        return NextResponse.json({ ok: false, error: "INVEST_FAILED" }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        success: true,
        order_id: (rpcResult as { order_id?: string })?.order_id ?? payment.order_id,
        data: { order_id: (rpcResult as { order_id?: string })?.order_id ?? payment.order_id },
      });
    }

    return NextResponse.json({ ok: false, error: "PG_NOT_READY" }, { status: 501 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await logSystem("API_ERROR", { route: "/api/payments/confirm", error: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
