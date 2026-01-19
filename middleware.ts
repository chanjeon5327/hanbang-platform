import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // 로그인 페이지는 항상 허용
  if (pathname === "/login" || pathname === "/admin/login") {
    return res;
  }

  // Supabase client (서버용)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 관리자 보호
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // 🔐 일반 사용자 보호 (홈 포함)
  const protectedPaths = ["/", "/wallet"];
  if (protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/", "/wallet/:path*", "/admin/:path*"],
};
