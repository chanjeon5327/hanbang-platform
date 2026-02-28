import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function num(x: unknown, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(num(searchParams.get('limit'), 30), 1), 200);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });

    const { data, error } = await (supabase as any)
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });

    const orders = (data ?? []).map((o: Record<string, unknown>) => {
      const contentId =
        o?.content_id ?? o?.content_item_id ?? o?.item_id ?? o?.product_id ?? o?.asset_id ?? null;

      return {
        ...o,
        _content_id: contentId,
        _side: o?.side ?? o?.order_side ?? o?.type ?? null,
        _status: o?.status ?? o?.state ?? null,
        _qty: o?.quantity ?? o?.qty ?? o?.amount ?? null,
        _price_krw: o?.price_krw ?? o?.price ?? null,
        _total_krw: o?.total_krw ?? o?.total ?? null,
      };
    });

    return NextResponse.json({ ok: true, orders });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'UNKNOWN' }, { status: 500 });
  }
}
