import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * POST /api/admin/kyc/approve - profiles.kyc_status → 'approved'
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const userId = body?.user_id ?? body?.userId ?? null;

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'MISSING_USER_ID' }, { status: 400 });
    }

    const admin = getAdminSupabase();
    await admin
      .from('profiles')
      .update({ kyc_status: 'approved' })
      .eq('id', userId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
