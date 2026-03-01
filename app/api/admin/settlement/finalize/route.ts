import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await requireAdmin();
  const supabase = getAdminSupabase();
  const body = await req.json().catch(() => ({}));
  const batch_id = body?.batch_id;
  if (!batch_id) return NextResponse.json({ ok:false, error:'MISSING_BATCH_ID' }, { status: 400 });

  // 1) 리포트 생성
  await supabase.rpc('rpc_generate_settlement_report', { p_batch_id: batch_id });

  // 2) 봉인(정산 확정)
  const { data, error } = await supabase.rpc('rpc_seal_settlement_batch', { p_batch_id: batch_id });
  if (error) return NextResponse.json({ ok:false, error }, { status: 500 });

  return NextResponse.json({ ok:true, redirected:true, ...data });
}
