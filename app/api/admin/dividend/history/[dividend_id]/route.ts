import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/dividend/history/[dividend_id]
 * dividend_distributions list
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dividend_id: string }> }
) {
  try {
    await requireAdmin();
    const { dividend_id } = await params;

    if (!dividend_id) {
      return NextResponse.json({ ok: false, error: 'dividend_id required' }, { status: 200 });
    }

    const admin = getAdminSupabase();

    const { data: dists, error } = await (admin as any)
      .from('dividend_distributions')
      .select('user_id, share_quantity, payout_amount, created_at')
      .eq('dividend_id', dividend_id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    const total_payout = (dists ?? []).reduce((s: number, d: { payout_amount?: number }) => s + Number(d.payout_amount ?? 0), 0);

    return NextResponse.json({
      ok: true,
      distributions: dists ?? [],
      total_payout,
      recipient_count: (dists ?? []).length,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
