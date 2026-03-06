/**
 * 로그아웃 시 localStorage 잔재 제거
 * - Supabase 기본 키: sb-*-auth-token
 * - hb_user 등 예전 로그인 판정용 키 제거 (로그인 판정은 session.user만 사용)
 * - hanbang_store 등 기타 잔재는 StoreContext에서 관리
 */
export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = ['hb_user'];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth-token'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k));
}
