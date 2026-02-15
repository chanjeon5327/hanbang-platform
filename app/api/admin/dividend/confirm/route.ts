import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json().catch(() => ({}));
    const dividendId = body.dividend_id ?? body.dividendId;

    if (!dividendId) {
      return NextResponse.json({ success: false, error: 'dividend_id required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('rpc_confirm_dividend', { p_dividend_id: dividendId });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const result = data as { ok?: boolean; error?: string };
    if (result?.ok === false) {
      return NextResponse.json({ success: false, error: result.error ?? '확정 실패' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
