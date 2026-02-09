// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Next.js 16: params는 Promise
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
  }

  // ✅ 서버(Service Role) 클라이언트
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select('id, price, quantity, filled_quantity, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }

  const qty = Number(data.filled_quantity ?? data.quantity ?? 0);
  const price = Number(data.price ?? 0);
  const amount = price * qty;

  return NextResponse.json({
    id: data.id,
    amount,
    created_at: data.created_at,
  });
}
