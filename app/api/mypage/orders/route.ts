import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: orders, error } = await (supabase as any)
    .from('orders')
    .select('id, content_id, product_id, type, order_type, price, quantity, filled_quantity, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const contentIds = [...new Set((orders ?? []).map((o: { content_id?: string; product_id?: string }) => o.content_id ?? o.product_id).filter(Boolean))];
  let titleMap: Record<string, string> = {};
  if (contentIds.length > 0) {
    const { data: items } = await supabase
      .from('content_items')
      .select('id, title')
      .in('id', contentIds);
    titleMap = Object.fromEntries((items ?? []).map((r: { id: string; title?: string }) => [r.id, r.title ?? '—']));
  }

  const items = (orders ?? []).map((o: Record<string, unknown>) => {
    const cid = (o.content_id ?? o.product_id) as string;
    return {
      id: o.id,
      created_at: o.created_at,
      side: (o.type as string) === 'SELL' ? 'sell' : 'buy',
      price: Number(o.price ?? 0),
      qty: Number(o.filled_quantity ?? o.quantity ?? 0),
      status: o.status,
      content_id: cid,
      title: titleMap[cid] ?? '—',
    };
  });

  return NextResponse.json({ orders: items });
}
