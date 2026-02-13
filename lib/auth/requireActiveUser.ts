import { createClient } from '@/lib/supabase/server';

/**
 * API에서 유저 정지(status=SUSPENDED) 검증
 * profiles.status 컬럼이 있을 때만 검증 (실제 DB에 status 없으면 통과)
 */
export async function requireActiveUser(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  // 실제 DB에 status 컬럼 없음. role로 대체 검증 (향후 status 추가 시 보강)
  if (profile?.role === 'SUSPENDED') {
    throw new Error('USER_SUSPENDED: 이 계정은 정지되었습니다. 문의해 주세요.');
  }
}
