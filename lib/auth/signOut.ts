import { getBrowserSupabase } from '@/utils/supabase/client';
import { clearAuthStorage } from './clearStorage';

/**
 * Supabase session 종료 + localStorage 정리 + 리다이렉트
 * - 모든 로그아웃 진입점에서 이 함수 사용
 */
export async function signOutAndCleanup(redirectTo: string = '/') {
  try {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut error (ignored):', err);
  }

  try {
    clearAuthStorage();
  } catch {}
  try { sessionStorage.clear(); } catch {}

  if (typeof window !== 'undefined') {
    window.location.href = redirectTo;
  }
}
