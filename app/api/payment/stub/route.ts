import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

/**
 * 결제 검증 스텁 (KCP 연동 전 E2E용)
 * - 주문 생성 후, 클라이언트에서 order_id로 호출
 * - rpc_confirm_payment 실행 → completed 전이 → ledger 자동 기록
 * - 중복 호출 시 rpc 내부에서 idempotent 반환
 */
export async function POST(req: Request) {
  let orderId: string;

  try {
    const body = await req.json();
    orderId = body.order_id ?? body.orderId;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (!orderId) {
    return NextResponse.json(
      { ok: false, error: 'order_id is required' },
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

  const supabase = await getServerSupabase();
  const { data: order } = await supabase
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

  try {
    const { data, error } = await supabase.rpc('rpc_confirm_payment', {
      p_order_id: orderId,
      p_amount_krw: amount,
      p_transaction_id: `stub-${Date.now()}`,
      p_payment_method: 'stub',
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
