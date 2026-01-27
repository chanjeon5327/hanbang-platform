import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * D3 FIX:
 * - "세션 있음"을 엄격하게 판단하지 않음
 * - "명백히 비로그인"만 차단
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. admin은 프론트에서 막지 않음 (RLS 전담)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 2. 보호 대상 경로
  const protectedPaths = [
    "/wallet",
    "/sell",
    "/seller",
    "/invest",
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  /**
   * 3. 명백한 비로그인 판정만 차단
   * - Supabase 쿠키가 아예 하나도 없을 때만 차단
   * - 로그인 직후 쿠키 반영 지연은 허용
   */
  const hasAnySupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("sb"));

  if (!hasAnySupabaseCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. 그 외는 통과 (실제 인증 여부는 페이지/서버에서 최종 판단)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/wallet/:path*",
    "/sell/:path*",
    "/seller/:path*",
    "/invest/:path*",
  ],
};
