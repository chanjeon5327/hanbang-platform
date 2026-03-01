import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const { data: userData, error: uerr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (uerr || !user) {
    return NextResponse.json({ ok: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const orderId = body?.order_id ?? body?.orderId ?? null;
  if (!orderId) {
    return NextResponse.json({ ok: false, error: 'MISSING_ORDER_ID' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('rpc_cancel_order_atomic', {
    p_user_id: user.id,
    p_order_id: orderId,
  });

  if (error) {
    const msg = String((error as { message?: string }).message ?? '');
    const code = String((error as { code?: string }).code ?? '');
    const status =
      msg.includes('ORDER_NOT_FOUND') ? 404 :
      msg.includes('INVALID_ORDER_STATUS') ? 400 :
      500;

    return NextResponse.json(
      { ok: false, error: 'CANCEL_FAILED', code, message: msg, detail: error },
      { status }
    );
  }

  return NextResponse.json(data ?? { ok: false });
}
