import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    try {
      // 카카오 열쇠를 실제 로그인 세션으로 교환
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('인증 처리 중 에러 발생:', error)
    }
  }

  // 성공하든 실패하든 하얀 에러창 대신 무조건 우리 사이트 메인으로 보냄
  return NextResponse.redirect(new URL('/', request.url))
}

