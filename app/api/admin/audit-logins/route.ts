import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';
import { requireAdmin } from '@/lib/admin/requireAdmin';

/**
 * GET /api/admin/audit-logins
 *
 * AUTH Phase-2: 로그인 감사 로그 조회 API (ADMIN 전용)
 *
 * Query params:
 *   period  — 7 | 30 | 1 (days, default 7)
 *   success — true | false | (없으면 전체)
 *   email   — 이메일 검색 (부분 일치)
 *   page    — 페이지 번호 (1-based, default 1)
 *   limit   — 페이지 크기 (default 200)
 */
export async function GET(req: NextRequest) {
  try {
    // ADMIN 권한 서버 검증
    await requireAdmin();
  } catch (e) {
    const msg = (e as Error).message ?? 'Unauthorized';
    const status = msg.includes('Forbidden') ? 403 : 401;
    return NextResponse.json({ error: msg }, { status });
  }

  const { searchParams } = new URL(req.url);
  const periodDays = Math.min(Number(searchParams.get('period') ?? '7'), 90);
  const successParam = searchParams.get('success');
  const emailParam   = searchParams.get('email')?.trim() || null;
  const page         = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit        = Math.min(Number(searchParams.get('limit') ?? '200'), 500);
  const offset       = (page - 1) * limit;

  const successFilter: boolean | null =
    successParam === 'true'  ? true  :
    successParam === 'false' ? false : null;

  try {
    // 데이터 조회 (service role — RLS bypass)
    let query = getAdminSupabase()
      .from('auth_login_audit')
      .select('id, user_id, email, ip_address, user_agent, success, event_type, failure_reason, created_at', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - periodDays * 86400_000).toISOString())
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (successFilter !== null) query = query.eq('success', successFilter);
    if (emailParam)             query = query.ilike('email', `%${emailParam}%`);

    const { data, count, error } = await query;

    if (error) {
      console.error('[audit-logins] query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok:    true,
      total: count ?? 0,
      page,
      limit,
      items: data ?? [],
    });
  } catch (e) {
    console.error('[audit-logins] unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
