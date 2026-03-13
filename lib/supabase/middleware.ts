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

  // ─────────────────────────────────────────────────
  // 🔒 [압도 긴급수리] 열람 공개 / 거래만 KYC
  // /login은 항상 통과 (비로그인에서도 로그인 페이지 접근 허용)
  // 보호 라우트가 아니면 즉시 통과 (/, /market, /feature 등 열람 허용)
  // ─────────────────────────────────────────────────
  const pathname = request.nextUrl.pathname
  if (pathname === '/login' || pathname.startsWith('/login/')) {
    return supabaseResponse
  }

  const protectedPrefixes = ['/wallet', '/order', '/dashboard', '/mypage', '/admin', '/creator/upload', '/invest', '/active-invest', '/onboarding']
  const isProtectedPath = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (!isProtectedPath) {
    return supabaseResponse
  }

  // 보호 라우트: 미로그인 → /login?redirect=현재경로
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // 로그인됐지만 온보딩 미완료 → /onboarding?redirect=원래경로
  // /onboarding 자체는 제외 (무한 리다이렉트 방지)
  const onboardingRequiredPaths = ['/wallet', '/order', '/dashboard', '/mypage', '/admin', '/creator/upload', '/invest', '/active-invest']
  if (
    pathname !== '/onboarding' &&
    !pathname.startsWith('/onboarding/') &&
    profileData?.onboarding_completed === false &&
    onboardingRequiredPaths.some((p) => pathname.startsWith(p))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // KYC 자동 리다이렉트 제거 - 로그인 후 홈 유지, KYC는 마이페이지 등에서 명시 진입 시에만
  // 보호 라우트(/mypage, /wallet 등)는 로그인만 확인, KYC 미승인 시에도 접근 허용

  return supabaseResponse
}
