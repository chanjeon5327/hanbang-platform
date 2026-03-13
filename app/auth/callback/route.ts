import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPostLoginRouteServer } from '@/lib/auth/getPostLoginRoute';

/**
 * GET /auth/callback?code=xxx&redirect=... (또는 next=...)
 * - OAuth 코드 교환, 쿠키 기반 세션 설정 (서버 전용)
 * - 로그인 성공 후 redirect/next 파라미터 → 온보딩 미완료면 /onboarding, 완료면 원래 경로
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const redirectParam = searchParams.get('redirect') || searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(new URL(redirectParam.startsWith('/') ? redirectParam : '/', req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error);
  }

  const path = await getPostLoginRouteServer(supabase, redirectParam);
  return NextResponse.redirect(new URL(path, req.url));
}
