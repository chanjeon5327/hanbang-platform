import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';
import { isAdminEmail } from '@/lib/auth/isAdminEmail';

export async function GET(req: Request) {
  const supabase = await getServerSupabase();

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

  if (error && process.env.NODE_ENV === 'development') {
    console.warn('[session] profile fetch:', error.message);
  }

  // 정지 계정 처리
  if (profile?.status === 'SUSPENDED') {
    await supabase.auth.signOut();
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
