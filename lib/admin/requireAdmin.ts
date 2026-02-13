import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from './env';

/**
 * API에서 관리자 권한 검증
 * - Supabase 세션 확인
 * - ADMIN_EMAILS 또는 profiles.role='ADMIN' 검증
 */
export async function requireAdmin(): Promise<{ email: string; id: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    throw new Error('Unauthorized: 로그인이 필요합니다.');
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = isAdminEmail(user.email) || profile?.role === 'ADMIN';
  if (!isAdmin) {
    throw new Error('Forbidden: 관리자 권한이 필요합니다.');
  }
  return { email: user.email, id: user.id };
}
