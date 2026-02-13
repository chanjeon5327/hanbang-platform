import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * PG 승인 콜백 API (KCP 등)
 * - pg_transaction_id, order_id 수신
 * - rpc_confirm_payment → rpc_finalize_order
 * - 멱등: pg_transaction_id UNIQUE, 중복 호출 시 안전 처리
 */
export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  let orderId: string;
  let pgTransactionId: string;

  try {
    if (contentType.includes('application/json')) {
      const body = await req.json();
      orderId = body.order_id ?? body.ordr_no ?? body.orderId ?? '';
      pgTransactionId = body.pg_transaction_id ?? body.tno ?? body.tid ?? body.transaction_id ?? '';
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      orderId = params.get('order_id') ?? params.get('ordr_no') ?? '';
      pgTransactionId = params.get('pg_transaction_id') ?? params.get('tno') ?? params.get('tid') ?? '';
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

  if (!orderId || !pgTransactionId) {
    return NextResponse.json(
      { ok: false, error: 'order_id and pg_transaction_id are required' },
      { status: 400 }
    );
  }

  if (!UUID_REGEX.test(String(orderId))) {
    return NextResponse.json(
      { ok: false, error: 'Invalid order_id format' },
      { status: 400 }
    );
  }

  // 멱등: pg_transaction_id 이미 처리된 경우
  const { data: existingPayment } = await supabaseAdmin
    .from('payments')
    .select('id')
    .eq('pg_transaction_id', pgTransactionId)
    .single();

  if (existingPayment) {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, total_amount_krw, status')
    .eq('id', orderId)
    .single();

  if (!order) {
    return NextResponse.json(
      { ok: false, error: 'ORDER_NOT_FOUND' },
      { status: 404 }
    );
  }

  const amount = Number(order.total_amount_krw ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Invalid order amount' },
      { status: 400 }
    );
  }

  // rpc_confirm_payment (PENDING → PAID)
  const { data: confirmData, error: confirmError } = await supabaseAdmin.rpc(
    'rpc_confirm_payment',
    {
      p_order_id: orderId,
      p_amount_krw: amount,
      p_transaction_id: pgTransactionId,
      p_payment_method: 'card',
    }
  );

  if (confirmError) {
    if (confirmError.message.includes('ORDER_NOT_FOUND')) {
      return NextResponse.json({ ok: false, error: confirmError.message }, { status: 404 });
    }
    if (confirmError.message.includes('AMOUNT_MISMATCH') || confirmError.message.includes('INVALID_STATUS')) {
      return NextResponse.json({ ok: false, error: confirmError.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: confirmError.message }, { status: 500 });
  }

  // rpc_finalize_order (PAID → COMPLETED, 원장 반영)
  const { error: finalizeError } = await supabaseAdmin.rpc('rpc_finalize_order', {
    p_order_id: orderId,
  });

  if (finalizeError) {
    return NextResponse.json(
      { ok: false, error: finalizeError.message },
      { status: 500 }
    );
  }

  // payments 테이블에 기록 (멱등용, unique violation 시 무시)
  const { error: payErr } = await supabaseAdmin.from('payments').insert({
    order_id: orderId,
    pg_transaction_id: pgTransactionId,
    status: 'APPROVED',
    amount,
  });
  if (payErr && !payErr.message.includes('duplicate') && !payErr.message.includes('unique')) {
    console.error('payments insert error:', payErr);
  }

  return NextResponse.json({ ok: true });
}
