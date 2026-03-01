// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'MISSING_ID' }, { status: 400 });
  }

  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('orders')
    .select('id, total_amount_krw, quantity, status, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
  }

  const amount = Number(data.total_amount_krw ?? 0);
  const qty = Number(data.quantity ?? 0);

  return NextResponse.json({
    id: data.id,
    amount,
    quantity: qty,
    status: data.status,
    created_at: data.created_at,
  });
}
