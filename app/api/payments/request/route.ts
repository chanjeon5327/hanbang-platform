import { NextResponse } from "next/server";
import { getServerSupabase } from "@/utils/supabase/server";
import { getAdminSupabase } from "@/utils/supabase/admin";
import { getClientIp, checkFraud } from "@/lib/fraudDetection";
import { logSystem } from "@/lib/systemLog";

const PG_SANDBOX = process.env.PG_SANDBOX === "true";

/**
 * POST /api/payments/request
 * [샌드박스] PG_SANDBOX=true: mock redirect_url 반환, pg_provider=SANDBOX
 * [실 PG] PG_SANDBOX=false: getPgRedirectUrl() 호출 (미구현 시 PLACEHOLDER)
 */
export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = authData.user;
    let body: { content_id?: string; product_id?: string; amount?: unknown; return_url?: string; order_id?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const returnUrl = typeof body.return_url === "string" ? body.return_url : undefined;
    const admin = getAdminSupabase();
    const now = new Date().toISOString();

    let orderId: string;
    let contentId: string;
    let amount: number;

    if (body.order_id && typeof body.order_id === "string") {
      const { data: order, error: orderErr } = await admin
        .from("orders")
        .select("id, content_id, total_amount_krw, user_id, status")
        .eq("id", body.order_id)
        .single();
      if (orderErr || !order) {
        return NextResponse.json({ ok: false, error: "ORDER_NOT_FOUND" }, { status: 404 });
      }
      if (order.user_id !== user.id) {
        return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });
      }
      if (order.status !== "PAYMENT_REQUESTED") {
        return NextResponse.json({ ok: false, error: "ORDER_STATUS_INVALID" }, { status: 400 });
      }
      orderId = order.id;
      contentId = order.content_id ?? "";
      amount = Math.floor(Number(order.total_amount_krw) || 0);
    } else {
      contentId = body.content_id ?? body.product_id ?? "";
      amount = Math.floor(Number(body.amount) || 0);
      if (!contentId || typeof contentId !== "string" || !/^[0-9a-f-]{36}$/i.test(contentId)) {
        return NextResponse.json({ ok: false, error: "content_id required (UUID)" }, { status: 400 });
      }
      if (amount <= 0) {
        return NextResponse.json({ ok: false, error: "amount must be positive" }, { status: 400 });
      }
      const { data: order, error: orderErr } = await admin
        .from("orders")
        .insert({
          user_id: user.id,
          content_id: contentId,
          status: "PAYMENT_REQUESTED",
          total_amount_krw: amount,
          quantity: 1,
          type: "BUY",
          order_type: "MARKET",
          price: amount,
        } as Record<string, unknown>)
        .select("id")
        .single();
      if (orderErr || !order?.id) {
        return NextResponse.json({ ok: false, error: "ORDER_CREATE_FAILED" }, { status: 500 });
      }
      orderId = order.id;
    }

    const ip = getClientIp(req.headers);
    const fraudResult = await checkFraud(user.id, contentId, amount, ip, req.headers);
    if (!fraudResult.ok) {
      return NextResponse.json({ ok: false, error: fraudResult.reason }, { status: 429 });
    }

    // 2) payments row 생성 (INIT, ip_address 저장)
    const { data: payment, error: payErr } = await admin
      .from("payments")
      .insert({
        order_id: orderId,
        user_id: user.id,
        content_id: contentId,
        amount,
        pg_provider: PG_SANDBOX ? "SANDBOX" : null,
        status: "INIT",
        created_at: now,
        ip_address: ip ?? undefined,
      } as Record<string, unknown>)
      .select("id")
      .single();

    if (payErr || !payment?.id) {
      return NextResponse.json({ ok: false, error: "PAYMENT_CREATE_FAILED" }, { status: 500 });
    }

    // PG redirect: 샌드박스=mock, 실PG=getPgRedirectUrl (미구현)
    const redirectUrl = PG_SANDBOX
      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/confirm?payment_id=${payment.id}&sandbox=1`
      : getPgRedirectUrl(payment.id, amount, returnUrl);

    return NextResponse.json({
      ok: true,
      success: true,
      order_id: orderId,
      payment_id: payment.id,
      redirect_url: redirectUrl,
      amount,
      sandbox: PG_SANDBOX,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await logSystem("API_ERROR", { route: "/api/payments/request", error: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

function getPgRedirectUrl(_paymentId: string, _amount: number, _returnUrl?: string): string {
  // getPgRedirectUrl() 미구현 - 실 PG 연동 시 toss/nice/kcp 등 구현
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/confirm?payment_id=PLACEHOLDER`;
}
