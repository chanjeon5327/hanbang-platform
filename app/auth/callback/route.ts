import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/callback?code=xxx&next=...
 * - OAuth 코드 교환, 쿠키 기반 세션 설정 (서버 전용)
 * - 로그인 성공 후 next 파라미터가 있으면 해당 경로, 없으면 / (홈)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const nextPath = searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(new URL(nextPath, req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error);
  }

  return NextResponse.redirect(new URL(nextPath, req.url));
}
