'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const init = async () => {
      try {
        // ✅ getUser()는 환경에 따라 "Auth session missing"을 에러로 던지는 경우가 있어
        // ✅ getSession()으로 안전하게 현재 세션만 확인합니다.
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          // 세션 조회 자체가 실패한 경우만 로그
          console.error('Error getting session:', error)
        }

        if (!mounted) return
        setUser(data.session?.user ?? null)
      } catch (e) {
        // 여기로 오면 진짜 예외 케이스라서만 로그
        console.error('Error getting session (exception):', e)
        if (!mounted) return
        setUser(null)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // 로그인/로그아웃/토큰리프레시 등 상태 변화 반영
      setUser(session?.user ?? null)
      // INITIAL_SESSION에서도 로딩이 풀리도록
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    try {
      await supabase.auth.signOut()
      setUser(null)

      // (옵션) 기존 로컬 상태/리스너와도 맞춰줌
      try {
        localStorage.removeItem('hb_user')
        window.dispatchEvent(new Event('loginStateChange'))
      } catch {}

      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div style={{
        padding: '6px 12px',
        fontSize: '12px',
        color: '#666',
        whiteSpace: 'nowrap'
      }}>
        확인 중...
      </div>
    )
  }

  if (user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '16px',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        whiteSpace: 'nowrap'
      }}>
        <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>
          로그인됨: {user.email || user.id.slice(0, 8)}
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            color: '#22c55e',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      borderRadius: '16px',
      border: '1px solid rgba(156, 163, 175, 0.2)',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
        로그아웃 상태
      </span>
      <button
        onClick={() => router.push('/login')}
        style={{
          padding: '4px 8px',
          fontSize: '11px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(156, 163, 175, 0.3)',
          borderRadius: '8px',
          color: '#9ca3af',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(156, 163, 175, 0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        로그인 페이지로
      </button>
    </div>
  )
}
