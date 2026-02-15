import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('item_id');
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    let q = (supabase as any)
      .from('dividends')
      .select('id, item_id, total_revenue, dividend_rate, total_dividend_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (itemId) q = q.eq('item_id', itemId);
    if (cursor) q = q.lt('created_at', cursor);

    const { data, error } = await q;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ ok: true, dividends: data ?? [], next_cursor: (data ?? []).length >= limit ? (data ?? [])[(data ?? []).length - 1]?.created_at : null });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
