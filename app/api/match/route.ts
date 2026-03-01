import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const itemId = body?.item_id ?? body?.itemId ?? body?.content_id ?? body?.contentId ?? null;
  if (!itemId) {
    return NextResponse.json({ ok: false, error: 'MISSING_ITEM_ID' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('rpc_match_orders', {
    p_item_id: itemId,
  });

  if (error) {
    const msg = String((error as { message?: string }).message ?? '');
    const status = msg.includes('INSUFFICIENT_SELLER_POSITION') ? 400 : 500;
    return NextResponse.json(
      { ok: false, error: 'MATCH_FAILED', message: msg, detail: error },
      { status }
    );
  }

  return NextResponse.json(data ?? { ok: false });
}
