import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const batchDate = body?.batch_date ?? body?.batchDate ?? null;

    if (!batchDate) {
      return NextResponse.json({ ok: false, error: 'MISSING_BATCH_DATE' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { data, error } = await supabase.rpc('rpc_create_settlement_batch', {
      p_batch_date: batchDate,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message, detail: error }, { status: 500 });
    }

    return NextResponse.json(data ?? { ok: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
