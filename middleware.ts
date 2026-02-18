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
 * - 정적 파일, API 라우트, Next.js 내부 경로는 제외
 * - 실제 페이지 라우트에만 미들웨어 적용
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (metadata files)
     * - /api/* (API routes - 각자 인증 처리)
     * - /*.* (static files with extension)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api|.*\\..*).*)',
  ],
};
