import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const batchId = body?.batch_id ?? body?.batchId ?? null;

    if (!batchId) {
      return NextResponse.json({ ok: false, error: 'MISSING_BATCH_ID' }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    await supabase.rpc('rpc_generate_settlement_report', { p_batch_id: batchId });

    const { data, error } = await supabase.rpc('rpc_seal_settlement_batch', {
      p_batch_id: batchId,
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
