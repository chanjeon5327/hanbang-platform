import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key) => cookieStore.get(key)?.value,
        },
      }
    );

    // 1️⃣ 세션 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2️⃣ 주문 조회 (본인 주문만)
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('id, buyer_id, status, ledger_posted_at')
      .eq('id', order_id)
      .single();

    if (orderFetchError || !order) {
      return NextResponse.json(
        { error: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // 이미 paid + ledger까지 게시된 주문이면 idempotent 성공 처리
    if (order.status === 'paid' && order.ledger_posted_at) {
      return NextResponse.json(
        { success: true, already_processed: true },
        { status: 200 }
      );
    }

    // 3️⃣ 상태 전이 (created → paid) (이미 paid면 스킵)
    if (order.status === 'created') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', order_id);

      if (updateError) {
        console.error(updateError);
        return NextResponse.json(
          { error: 'ORDER_UPDATE_FAILED' },
          { status: 500 }
        );
      }
    } else if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'INVALID_ORDER_STATUS' },
        { status: 400 }
      );
    }

    // 4️⃣ 투자 집행 RPC (paid 주문 → 원장 자동 기록)
    const { error: rpcError } = await supabase.rpc('rpc_invest', {
      p_order_id: order_id,
    });

    // 이미 원장이 게시된 주문은 성공으로 처리(중복 호출 방지)
    if (rpcError) {
      const msg = rpcError.message ?? '';
      if (msg.includes('LEDGER_ALREADY_POSTED')) {
        return NextResponse.json(
          { success: true, already_processed: true },
          { status: 200 }
        );
      }

      console.error(rpcError);
      return NextResponse.json(
        { error: 'INVEST_RPC_FAILED', detail: msg },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
