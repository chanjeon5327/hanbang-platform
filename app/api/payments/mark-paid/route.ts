import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();

  try {
    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json(
        { error: 'order_id missing' },
        { status: 400 }
      );
    }

    // 1️⃣ 주문 paid 처리
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('status', 'pending');

    if (updateError) throw updateError;

    // 2️⃣ 투자 RPC 실행
    const { error: rpcError } = await supabase.rpc('rpc_invest', {
      p_order_id: order_id,
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[mark-paid]', e);
    return NextResponse.json(
      { error: e.message ?? 'unknown error' },
      { status: 500 }
    );
  }
}
