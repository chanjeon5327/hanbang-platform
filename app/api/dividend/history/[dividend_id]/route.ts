import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dividend_id: string }> }
) {
  try {
    const { dividend_id } = await params;
    if (!dividend_id) {
      return NextResponse.json({ ok: false, error: 'dividend_id required' }, { status: 200 });
    }

    const supabase = await createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: div, error: e1 } = await (supabase as any)
      .from('dividends')
      .select('id, item_id, total_revenue, dividend_rate, total_dividend_amount, created_at')
      .eq('id', dividend_id)
      .single();

    if (e1 || !div) {
      return NextResponse.json({ ok: false, error: 'dividend not found' }, { status: 200 });
    }

    const { data: dists } = await (supabase as any)
      .from('dividend_distributions')
      .select('payout_amount')
      .eq('dividend_id', dividend_id);

    const total_payout = (dists ?? []).reduce((s: number, d: { payout_amount?: number }) => s + Number(d.payout_amount ?? 0), 0);
    const recipient_count = (dists ?? []).length;

    return NextResponse.json({
      ok: true,
      dividend: { ...div, total_payout, recipient_count },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
