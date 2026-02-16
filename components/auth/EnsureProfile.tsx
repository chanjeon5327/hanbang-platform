'use client'

import React, { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

// profiles 테이블 최소 타입 정의
type Profile = {
  id: string
  email?: string | null
  created_at?: string | null
}

/**
 * EnsureProfile
 * - 로그아웃 상태에서 supabase.auth.getUser() 호출로
 *   AuthSessionMissingError 로그가 찍히는 것을 방지하기 위해
 *   getSession()으로 먼저 세션을 확인하고, 세션이 있을 때만 처리한다.
 *
 * 중요:
 * - app/layout.tsx에서 named import( { EnsureProfile } )로 가져오므로
 *   named export를 사용한다.
 */
export function EnsureProfile({ children }: { children: React.ReactNode }) {
  const didRunRef = useRef(false)

  useEffect(() => {
    // 개발환경 StrictMode에서 useEffect가 2번 실행되는 경우 방지
    if (didRunRef.current) return
    didRunRef.current = true

    const supabase = createClient()

    const run = async () => {
      // 1) 세션 먼저 확인 (세션 없으면 조용히 종료)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) return

      const session = sessionData.session
      if (!session?.user) {
        // 로그아웃 상태는 정상 -> 조용히 종료 (콘솔 에러 금지)
        return
      }

      const user = session.user

      // 2) (선택) profiles upsert — 스키마/테이블 없으면 조용히 스킵
      try {
        const profileData: Profile = {
          id: user.id,
          email: user.email ?? null,
        }

        // profiles 테이블이 타입에 정의되지 않았을 수 있으므로 타입 단언 사용
        const { data, error } = await (supabase.from('profiles') as any)
          .upsert(profileData, { onConflict: 'id' })
          .select()
          .single()

        if (error) {
          // 테이블이 없거나 권한 문제 등은 조용히 스킵
          return
        }

        // 타입 안전하게 캐스팅
        const profile = data as Profile | null
        if (profile) {
          // 성공적으로 업서트됨 (필요시 추가 처리)
        }
      } catch (e) {
        // 예외 발생 시 조용히 스킵 (콘솔 에러 금지)
        return
      }
    }

    run()
  }, [])

  return <>{children}</>
}

// app/layout.tsx에서 named import로 사용하므로 default export도 제공
export default EnsureProfile

