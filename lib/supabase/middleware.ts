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
  // 🔒 [AUTH Phase-2] 관리자 강제 로그아웃 + 동시 로그인 제한 확인
  // 🔒 [유입 확대 3-1] KYC/온보딩 강제 라우팅용 profile 캐시
  // 단일 DB 조회로 두 가지 정책을 동시에 처리
  // ─────────────────────────────────────────────────
  let profileData: { kyc_status?: string; onboarding_completed?: boolean; last_login_at?: string; force_logout_at?: string; session_version?: string } | null = null

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_login_at, force_logout_at, session_version, kyc_status, onboarding_completed')
        .eq('id', user.id)
        .single()

      profileData = profile ?? null

      if (profile) {
        // ── 관리자 강제 로그아웃 확인 ──
        if (profile.force_logout_at && profile.last_login_at) {
          const forceLogoutTime = new Date(profile.force_logout_at).getTime()
          const lastLoginTime = new Date(profile.last_login_at).getTime()

          if (forceLogoutTime > lastLoginTime) {
            console.warn(`[FORCE_LOGOUT] User ${user.id}`)
            await supabase.auth.signOut()
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('reason', 'force_logout')
            return NextResponse.redirect(url)
          }
        }

        // ── [AUTH Phase-2 / 8-2] 동시 로그인 제한 ──
        // 쿠키에 session_version이 있고 DB 값과 다르면 → 다른 기기/브라우저에서 로그인한 것
        // 현재 세션을 무효화하고 /login?reason=concurrent 으로 리다이렉트
        const cookieSessionVersion = request.cookies.get('hb_session_version')?.value
        if (
          profile.session_version &&
          cookieSessionVersion &&
          cookieSessionVersion !== profile.session_version
        ) {
          console.warn(`[CONCURRENT_SESSION] User ${user.id} - evicting old session`)
          await supabase.auth.signOut()
          const url = request.nextUrl.clone()
          url.pathname = '/login'
          url.searchParams.set('reason', 'concurrent')
          return NextResponse.redirect(url)
        }
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[MIDDLEWARE] session policies check:', (err as Error)?.message);
      }
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
    pathname.startsWith('/design') ||
    pathname.startsWith('/market') ||
    pathname.startsWith('/api')

  // 공개 페이지가 아니고 로그인하지 않은 경우에만 리다이렉트
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ─────────────────────────────────────────────────
  // 🔒 [유입 확대 3-1] KYC/온보딩 강제 라우팅
  // 투자 관련 경로: KYC 미승인 → /kyc, 온보딩 미완료 → /onboarding
  // ─────────────────────────────────────────────────
  const protectedPaths = ['/wallet', '/market', '/trade', '/order']
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p))

  if (user && isProtectedPath) {
    if (!profileData || profileData.kyc_status !== 'approved') {
      const url = request.nextUrl.clone()
      url.pathname = '/kyc'
      return NextResponse.redirect(url)
    }
    if (!profileData.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
