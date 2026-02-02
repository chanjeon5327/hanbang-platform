import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * D3 FIX:
 * - API 경로는 무조건 middleware 통과
 * - 프론트 라우트만 최소한으로 보호
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ 0. API는 무조건 통과 (가장 중요)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

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
   */
  const hasAnySupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("sb"));

  if (!hasAnySupabaseCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/wallet/:path*",
    "/sell/:path*",
    "/seller/:path*",
    "/invest/:path*",
    // ❗ api는 matcher에 넣지 않음
  ],
};
