import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin/env';

/**
 * GET /api/auth/session
 * - 쿠키 기반 세션만 신뢰 (서버에서 cookies 읽기)
 * - SUSPENDED 유저는 null 반환 후 로그아웃
 * - ?admin=1: isAdmin, profile 포함 (관리자 레이아웃용)
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return NextResponse.json({ user: null, error: error.message }, { status: 200 });
  }

  let user = session?.user ?? null;

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('status, role, display_name').eq('id', user.id).single();
    if (profile?.status === 'SUSPENDED') {
      await supabase.auth.signOut({ scope: 'local' });
      user = null;
    } else if (req.nextUrl.searchParams.get('admin') === '1') {
      const isAdmin = isAdminEmail(user.email ?? '') || profile?.role === 'ADMIN';
      return NextResponse.json({
        user,
        isAdmin,
        profile: profile ? { display_name: profile.display_name, role: profile.role } : null,
      });
    }
  }

  return NextResponse.json({ user });
}
