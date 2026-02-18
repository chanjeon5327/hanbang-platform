/**
 * ⚠️ 이 파일은 비활성화되어 있습니다.
 * 현재 활성 미들웨어: middleware.ts (루트)
 * 실제 인증 로직: lib/supabase/middleware.ts의 updateSession()
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            res.cookies.set(name, value)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api|login).*)'],
};
