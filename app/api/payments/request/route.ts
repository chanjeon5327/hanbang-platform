import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';
import type { Tables } from '@/lib/supabase/types';

type OrderRow = Tables<'orders'>;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 결제 요청 API (KCP 연동)
 * - order_id 검증
 * - order.status = PENDING 확인
 * - KCP 결제 요청 payload 생성
 * - redirect_url 반환
 */
export async function POST(req: Request) {
  let orderId: string;

  try {
    const body = await req.json();
    orderId = body.order_id ?? body.orderId ?? '';
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  if (!orderId || !UUID_REGEX.test(String(orderId))) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or missing order_id' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    await requireActiveUser(user.id);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'USER_SUSPENDED' },
      { status: 403 }
    );
  }

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, price, quantity, status')
    .eq('id', orderId)
    .single();

  const order = orderData as OrderRow | null;

  if (orderError || !order) {
    return NextResponse.json(
      { ok: false, error: 'ORDER_NOT_FOUND' },
      { status: 404 }
    );
  }

  if (order.user_id !== user.id) {
    return NextResponse.json(
      { ok: false, error: '본인 주문만 결제할 수 있습니다.' },
      { status: 403 }
    );
  }

  if (order.status !== 'PENDING') {
    return NextResponse.json(
      { ok: false, error: `INVALID_STATUS: 결제 가능한 상태가 아닙니다. (현재: ${order.status})` },
      { status: 400 }
    );
  }

  const totalAmount = order.price * order.quantity;
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Invalid order amount' },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const isTestMode = process.env.KCP_TEST_MODE === 'true' || !process.env.KCP_SITE_CD;

  let redirectUrl: string;

  if (isTestMode) {
    // 테스트 모드: 내부 결제 시뮬레이션 페이지로 이동
    redirectUrl = `${baseUrl}/order/pay?order_id=${orderId}&amount=${totalAmount}`;
  } else {
    // KCP 실제 연동: 결제창 URL 생성
    const siteCd = process.env.KCP_SITE_CD ?? 'T0000';
    const returnUrl = `${baseUrl}/order/return`;
    const kcpGateway = process.env.KCP_GATEWAY_URL ?? 'https://testspay.kcp.co.kr';
    redirectUrl = `${kcpGateway}/gateway?site_cd=${siteCd}&ordr_idxx=${orderId}&ordr_mony=${totalAmount}&return_url=${encodeURIComponent(returnUrl)}`;
  }

  return NextResponse.json({
    ok: true,
    redirect_url: redirectUrl,
    order_id: orderId,
    amount: totalAmount,
  });
}
