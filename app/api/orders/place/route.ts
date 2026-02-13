import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireActiveUser } from '@/lib/auth/requireActiveUser';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    await requireActiveUser(user.id);
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? 'USER_SUSPENDED' },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { productId, marketId, side, price, quantity } = body;

  const productIdResolved = productId ?? marketId;
  if (!productIdResolved) {
    return NextResponse.json(
      { success: false, error: 'productId 또는 marketId가 필요합니다.' },
      { status: 400 }
    );
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let productUuid = String(productIdResolved);
  if (!uuidRegex.test(productUuid)) {
    productUuid = process.env.STUB_PRODUCT_ID ?? 'a1b2c3d4-e5f6-4789-a012-345678901234';
  }

  const pPrice = Number(price);
  const pQty = Number(quantity);
  if (!Number.isFinite(pPrice) || pPrice < 0 || !Number.isFinite(pQty) || pQty <= 0) {
    return NextResponse.json(
      { success: false, error: '가격과 수량이 올바르지 않습니다.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc('rpc_place_order', {
    p_market_id: productUuid,
    p_side: side ?? 'BUY',
    p_price: pPrice,
    p_quantity: pQty,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data });
}
