import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = createClient();
  const body = await req.json();

  const { marketId, side, price, quantity } = body;

  const { data, error } = await supabase.rpc('rpc_place_order', {
    p_market_id: marketId,
    p_side: side,
    p_price: price,
    p_quantity: quantity,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data });
}
