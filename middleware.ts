import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 미들웨어 완전 제외 경로
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/sell") // ⭐ 출품 경로 허용
  ) {
    return NextResponse.next();
  }

  // 예시: 쿠키 기반 세션 체크 (프로젝트 기존 로직 유지)
  const isLoggedIn = req.cookies.get("sb-access-token");

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api).*)"],
};
