import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/settlement/batches - settlement_batches 理쒓렐 10媛?
 */
export async function GET() {
  try {
    await requireAdmin();

    const admin = getAdminSupabase();
    const { data, error } = await admin
      .from('settlement_batches')
      .select('id, settlement_date, confirmed_at')
      .order('settlement_date', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []).map((r: { id: string; settlement_date: string; confirmed_at: string | null }) => ({
      id: r.id,
      settlement_date: r.settlement_date,
      status: r.confirmed_at ? 'CONFIRMED' : 'PENDING',
    }));

    return NextResponse.json({ batches: rows });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

