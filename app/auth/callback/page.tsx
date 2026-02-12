'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const finalizeSession = async () => {
      const supabase = createBrowserClient()
      
      try {
        const code = searchParams.get('code')
        
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Code exchange error:', error)
          } else {
            console.log('Session established via code exchange')
          }
        } else {
          console.warn('No code parameter found in callback URL')
        }
      } catch (error) {
        console.error('Session finalization error:', error)
      } finally {
        router.replace('/')
      }
    }

    finalizeSession()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-gray-600">로그인 처리중...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-gray-600">로그인 처리중...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}

