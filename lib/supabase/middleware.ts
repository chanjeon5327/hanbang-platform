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

  const { data: { session }, error } = await supabase.auth.getSession()
  const user = session?.user ?? null

  // 공개 페이지는 인증 없이 접근 가능
  const publicPaths = ['/', '/login', '/signup', '/auth', '/projects', '/active-invest', '/notice']
  const isPublicPath = publicPaths.some((path) => {
    return request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  })

  // 공개 페이지가 아니고 로그인하지 않은 경우에만 리다이렉트
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
