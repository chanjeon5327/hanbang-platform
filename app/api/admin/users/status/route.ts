import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/users/status?user_id=xxx - 유저 상태/로그 (관리자)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const userId = req.nextUrl.searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: profile } = await (admin as any).from('profiles').select('id, email, status, role').eq('id', userId).single();
    const { data: logs } = await (admin as any).from('user_status_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20);

    return NextResponse.json({
      profile: profile ?? null,
      logs: logs ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
