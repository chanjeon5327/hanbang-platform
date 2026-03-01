import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/dividend/history
 * dividends 최근 50개
 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    const admin = getAdminSupabase();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('item_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let q = (admin as any)
      .from('dividends')
      .select('id, item_id, total_revenue, dividend_rate, total_dividend_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (itemId) q = q.eq('item_id', itemId);
    if (dateFrom) q = q.gte('created_at', dateFrom);
    if (dateTo) q = q.lte('created_at', dateTo);

    const { data, error } = await q;

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ ok: true, dividends: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
