import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { getClientIp, checkFraud } from "@/lib/fraudDetection";
import { logSystem } from "@/lib/systemLog";

const PG_SANDBOX = process.env.PG_SANDBOX === "true";

/**
 * POST /api/payments/request
 * 1) 이상 거래 탐지
 * 2) order 생성 (INIT → PAYMENT_REQUESTED)
 * 3) payments row 생성 (INIT, ip_address 저장)
 * 4) PG redirect URL 반환 (샌드박스 시 mock URL)
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = authData.user;
    let body: { content_id?: string; product_id?: string; amount?: unknown; return_url?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    const contentId = body.content_id ?? body.product_id;
    const amount = Math.floor(Number(body.amount) || 0);
    const returnUrl = typeof body.return_url === "string" ? body.return_url : undefined;

    if (!contentId || typeof contentId !== "string" || !/^[0-9a-f-]{36}$/i.test(contentId)) {
      return NextResponse.json({ error: "content_id required (UUID)" }, { status: 400 });
    }
    if (amount <= 0) {
      return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
    }

    const ip = getClientIp(req.headers);
    const fraudResult = await checkFraud(user.id, contentId, amount, ip, req.headers);
    if (!fraudResult.ok) {
      return NextResponse.json({ error: fraudResult.reason }, { status: 429 });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();

    // 1) order 생성 (PAYMENT_REQUESTED)
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
      return NextResponse.json({ error: "ORDER_CREATE_FAILED", debug: orderErr?.message }, { status: 500 });
    }

    // 2) payments row 생성 (INIT, ip_address 저장)
    const { data: payment, error: payErr } = await admin
      .from("payments")
      .insert({
        order_id: order.id,
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
      return NextResponse.json({ error: "PAYMENT_CREATE_FAILED", debug: payErr?.message }, { status: 500 });
    }

    // 3) PG redirect URL (샌드박스 시 mock)
    const redirectUrl = PG_SANDBOX
      ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/confirm?payment_id=${payment.id}&sandbox=1`
      : await getPgRedirectUrl(payment.id, amount, returnUrl);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      payment_id: payment.id,
      redirect_url: redirectUrl,
      sandbox: PG_SANDBOX,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await logSystem("API_ERROR", { route: "/api/payments/request", error: msg });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function getPgRedirectUrl(_paymentId: string, _amount: number, _returnUrl?: string): Promise<string> {
  // TODO: 실제 PG 연동 시 구현
  // 예: toss, nice, kcp 등 redirect URL 생성
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/confirm?payment_id=PLACEHOLDER`;
}
