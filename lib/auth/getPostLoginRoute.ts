/**
 * 로그인 성공 후 이동 경로 결정
 * - redirect 파라미터 최우선
 * - 온보딩 미완료 → /onboarding?redirect=원래경로
 * - 온보딩 완료 → 원래 경로 또는 /
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * redirect 파라미터 검증: 내부 경로만 허용, 외부 URL 차단
 * - 비어있거나 잘못되면 /
 * - http://, https://, // 로 시작하면 차단
 */
export function sanitizeRedirect(redirectParam?: string | null): string {
  const fallback = '/';
  const redirect = (redirectParam ?? '').trim() || fallback;
  if (!redirect || redirect === fallback) return fallback;
  if (redirect.startsWith('//') || redirect.startsWith('http://') || redirect.startsWith('https://')) {
    return fallback;
  }
  return redirect.startsWith('/') ? redirect : fallback;
}

export async function getPostLoginRoute(
  supabase: SupabaseClient,
  redirectParam?: string | null
): Promise<string> {
  const safeRedirect = sanitizeRedirect(redirectParam);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '/login';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    const completed = profile?.onboarding_completed === true;
    if (!completed) {
      return `/onboarding?redirect=${encodeURIComponent(safeRedirect)}`;
    }
    return safeRedirect;
  } catch {
    return safeRedirect;
  }
}

/** 서버(route handler)에서 사용. redirectParam은 next 또는 redirect 쿼리 */
export async function getPostLoginRouteServer(
  supabase: SupabaseClient,
  redirectParam?: string | null
): Promise<string> {
  return getPostLoginRoute(supabase, redirectParam);
}
