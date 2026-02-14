import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/lib/auth/isAdminEmail';

export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('status, role, display_name')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('profile fetch error:', error);
  }

  // 정지 계정 처리
  if (profile?.status === 'SUSPENDED') {
    await supabase.auth.signOut({ scope: 'local' });
    return NextResponse.json({ user: null });
  }

  const isAdmin =
    isAdminEmail(user.email ?? '') ||
    profile?.role === 'ADMIN';

  return NextResponse.json({
    user,
    profile,
    isAdmin,
  });
}
