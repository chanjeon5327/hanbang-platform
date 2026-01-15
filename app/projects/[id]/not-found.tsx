import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold mb-4">프로젝트를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mb-8">
          요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
        </p>
        <Link href="/">
          <Button>홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  )
}

