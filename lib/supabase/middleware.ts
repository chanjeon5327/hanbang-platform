import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  let user = null
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (!error?.message?.includes('refresh_token_not_found')) {
      user = session?.user ?? null
    }
  } catch (e) {
    const msg = (e as Error)?.message ?? ''
    if (msg.includes('refresh_token_not_found')) {
      // 세션 만료/쿠키 삭제 등으로 refresh token 없음 → 무시
    } else {
      throw e
    }
  }

  // 공개 페이지: /demo, /market 하위 경로까지 인증 없이 접근 가능
  const pathname = request.nextUrl.pathname
  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/active-invest') ||
    pathname.startsWith('/notice') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/market') ||
    pathname.startsWith('/api') // API는 각 라우트에서 401 반환

  // 공개 페이지가 아니고 로그인하지 않은 경우에만 리다이렉트
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
