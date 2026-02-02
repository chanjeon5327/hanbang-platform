import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { product_id, quantity } = body;

    if (!product_id || !quantity || quantity <= 0) {
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

    // 2️⃣ 상품 확인
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, price, status')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (product.status !== 'active') {
      return NextResponse.json(
        { error: 'PRODUCT_NOT_ACTIVE' },
        { status: 400 }
      );
    }

    const unit_price = product.price;
    const total_price = unit_price * quantity;

    // 3️⃣ 주문 생성 (status = created)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        product_id,
        quantity,
        unit_price,
        total_price,
        status: 'created',
      })
      .select('id')
      .single();

    if (orderError) {
      console.error(orderError);
      return NextResponse.json(
        { error: 'ORDER_CREATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({ order_id: order.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
