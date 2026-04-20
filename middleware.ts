/**
 * Next.js Middleware - 인증 및 세션 관리
 *
 * 역할:
 * - Supabase 세션 자동 갱신
 * - 보호 라우트에 대한 로그인 강제 (lib/supabase/middleware.updateSession 위임)
 *
 * 주의:
 *   updateSession()이 이미 /login 으로 리다이렉트할 때 ?redirect=원래경로 를 부여한다.
 *   여기서 별도로 ?next= 를 또 붙이면 쿼리가 중복(?redirect=...&next=...)되어
 *   QA 보고서 M1 이슈가 발생한다. 단일 출처 정책: redirect 쿼리만 사용.
 */

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Matcher 설정:
 * - 정적/API 제외, 페이지 라우트에 적용 (세션 갱신)
 * - 리다이렉트는 보호 라우트만 (lib/supabase/middleware)
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|opengraph-image|twitter-image|icon|.*\\..*).*)',
  ],
};
