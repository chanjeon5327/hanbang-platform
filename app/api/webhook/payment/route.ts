import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * PG 결제 콜백 웹훅 (KCP 등)
 * - PG 심사: 서버 검증, 금액 매칭, 중복 콜백 방지
 * - 원장: completed 전이 시 ledger 트리거 자동 기록
 *
 * 지원 페이로드 (JSON 또는 form-urlencoded):
 * - order_id: 주문 UUID (필수)
 * - amount: 결제 금액 원화 (필수)
 * - transaction_id: PG 거래 ID (선택)
 * - payment_method: 결제수단 (선택, 기본 card)
 *
 * TODO: PG 선택 시 서명 검증 추가 (KCP: kcp_cert_info 등)
 */
export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  let orderId: string;
  let amount: number;
  let transactionId: string | undefined;
  let paymentMethod: string | undefined;

  try {
    if (contentType.includes('application/json')) {
      const body = await req.json();
      orderId = body.order_id ?? body.ordr_no ?? body.orderId;
      amount = Number(body.amount ?? body.ordr_mony ?? body.amount_krw);
      transactionId = body.transaction_id ?? body.tno ?? body.tid;
      paymentMethod = body.payment_method ?? body.pay_type ?? 'card';
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      orderId = params.get('order_id') ?? params.get('ordr_no') ?? '';
      amount = Number(params.get('amount') ?? params.get('ordr_mony') ?? 0);
      transactionId = params.get('transaction_id') ?? params.get('tno') ?? undefined;
      paymentMethod = params.get('payment_method') ?? params.get('pay_type') ?? 'card';
    } else {
      return NextResponse.json(
        { ok: false, error: 'Content-Type must be application/json or application/x-www-form-urlencoded' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!orderId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: 'order_id and amount are required' },
      { status: 400 }
    );
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(String(orderId))) {
    return NextResponse.json(
      { ok: false, error: 'Invalid order_id format' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  try {
    const { data, error } = await supabase.rpc('rpc_confirm_payment', {
      p_order_id: orderId,
      p_amount_krw: amount,
      p_transaction_id: transactionId ?? null,
      p_payment_method: paymentMethod ?? 'card',
    });

    if (error) {
      if (error.message.includes('ORDER_NOT_FOUND')) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
      }
      if (error.message.includes('AMOUNT_MISMATCH')) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
