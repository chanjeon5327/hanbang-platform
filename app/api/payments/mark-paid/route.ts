import { NextResponse } from 'next/server';
import { createClient as createCookieClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.order_id ?? body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_ORDER_ID' },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');

    // ✅ (1) 결제사 콜백/서버 내부 호출: service role 있으면 그걸로 처리
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = serviceKey
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false } })
      : createCookieClient(); // ✅ (2) 일반 호출: 세션 쿠키 기반

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}
