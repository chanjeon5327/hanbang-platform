import { createClient } from '@/lib/supabase/server';

/**
 * API에서 유저 정지(status=SUSPENDED) 검증
 * SUSPENDED면 차단
 */
export async function requireActiveUser(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', userId)
    .single();

  if (profile?.status === 'SUSPENDED') {
    throw new Error('USER_SUSPENDED: 이 계정은 정지되었습니다. 문의해 주세요.');
  }
}
