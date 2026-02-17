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

  // ─────────────────────────────────────────────────
  // 🔒 관리자 강제 로그아웃 확인
  // ─────────────────────────────────────────────────
  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_login_at, force_logout_at')
        .eq('id', user.id)
        .single()

      if (profile?.force_logout_at && profile?.last_login_at) {
        const forceLogoutTime = new Date(profile.force_logout_at).getTime()
        const lastLoginTime = new Date(profile.last_login_at).getTime()

        // 관리자가 설정한 강제 로그아웃 시간이 마지막 로그인 시간보다 나중이면
        // → 세션 무효화 (관리자가 사용자 강제 로그아웃 처리)
        if (forceLogoutTime > lastLoginTime) {
          console.warn(`[FORCE_LOGOUT] User ${user.id} - Admin forced logout`)
          
          // 세션 무효화
          await supabase.auth.signOut()

          // /login으로 리다이렉트
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('reason', 'force_logout')
          return NextResponse.redirect(url)
        }
      }
    } catch (err) {
      // profiles 조회 실패 시 무시 (서비스 중단 방지)
      console.error('[MIDDLEWARE] Failed to check force_logout_at:', err)
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
    // 원래 경로를 ?next= 쿼리로 보존하여 로그인 후 돌아올 수 있게 함
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
