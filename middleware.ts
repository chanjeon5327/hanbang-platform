import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // admin 경로만 보호
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // admin/login 은 통과
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Supabase 로그인 시 생성되는 쿠키
  const accessToken =
    req.cookies.get("sb-access-token")?.value ||
    req.cookies.get("supabase-auth-token")?.value;

  // 로그인 안 돼 있으면 관리자 로그인으로
  if (!accessToken) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
