"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import LoginModal from "@/components/auth/LoginModal"
import { createClient } from "@/utils/supabase/client"
import { TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface InvestmentButtonProps {
  projectId: string
}

export function InvestmentButton({ projectId }: InvestmentButtonProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleInvest = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    const user = session?.user ?? null

    if (!user) {
      setIsLoginModalOpen(true)
    } else {
      // 로그인된 경우 투자 페이지로 이동
      router.push(`/projects/${projectId}/invest/confirm`)
    }
  }

  return (
    <>
      <Button onClick={handleInvest} className="w-full" size="lg">
        매수
        <TrendingUp className="ml-2 h-4 w-4" />
      </Button>

      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </>
  )
}

