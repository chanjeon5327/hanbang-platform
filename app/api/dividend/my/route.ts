import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dists, error } = await (supabase as any)
      .from('dividend_distributions')
      .select('id, dividend_id, share_quantity, payout_amount, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    const ids = [...new Set((dists ?? []).map((d: { dividend_id: string }) => d.dividend_id))];
    const { data: divs } = ids.length
      ? await (supabase as any).from('dividends').select('id, item_id, total_dividend_amount, created_at').in('id', ids)
      : { data: [] };

    const divMap = new Map((divs ?? []).map((d: { id: string }) => [d.id, d]));
    const items = (dists ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      dividend: divMap.get(r.dividend_id as string),
    }));

    return NextResponse.json({ ok: true, distributions: items });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
