import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ admin은 RLS로만 보호 (프론트에서 막지 않음)
  if (pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // 기존 로그인 가드
  // if (!session && pathname.startsWith("/protected")) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return NextResponse.next();
}
