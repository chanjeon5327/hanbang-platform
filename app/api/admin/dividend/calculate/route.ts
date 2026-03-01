import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * POST /api/admin/dividend/calculate
 * body: { item_id, total_revenue, dividend_rate }
 * rpc_calculate_dividend 호출
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const itemId = body.item_id ?? body.itemId;
    const totalRevenue = Number(body.total_revenue ?? body.totalRevenue ?? 0);
    const dividendRate = Number(body.dividend_rate ?? body.dividendRate ?? 0.3);

    if (!itemId || typeof itemId !== 'string') {
      return NextResponse.json({ success: false, error: 'item_id required' }, { status: 400 });
    }

    const admin = getAdminSupabase();
    const { data, error } = await admin.rpc('rpc_calculate_dividend', {
      p_item_id: itemId,
      p_total_revenue: totalRevenue,
      p_dividend_rate: dividendRate,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const result = data as { ok?: boolean; dividend_id?: string; total_dividend?: number };
    return NextResponse.json({
      success: true,
      dividend_id: result?.dividend_id,
      total_dividend: result?.total_dividend,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
