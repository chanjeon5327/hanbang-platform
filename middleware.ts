/**
 * Next.js Middleware - 인증 및 세션 관리
 * 
 * 역할:
 * - Supabase 세션 자동 갱신
 * - 보호 라우트에 대한 로그인 강제
 * - 미로그인 사용자를 /login으로 리다이렉트 (원래 경로는 ?next=... 로 보존)
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // lib/supabase/middleware의 updateSession을 호출하여
  // 세션 갱신 및 인증 리다이렉트 처리
  const response = await updateSession(request);

  // updateSession이 리다이렉트를 반환하면 그대로 전달
  if (response.status === 307 || response.status === 308) {
    // 리다이렉트 응답이면 원래 경로를 ?next= 쿼리로 추가
    const redirectUrl = new URL(response.headers.get('location') || '/login', request.url);
    
    // 이미 /login으로 가는 리다이렉트이고, 원래 경로가 있으면 ?next 추가
    if (redirectUrl.pathname === '/login' && request.nextUrl.pathname !== '/login') {
      redirectUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
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
