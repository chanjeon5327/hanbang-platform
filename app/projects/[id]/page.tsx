import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Header from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { InvestmentButton } from "@/components/InvestmentButton"
import { getYtThumb } from "@/lib/thumbnails"

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !project) {
    notFound()
  }

  const p = project
  const progressPercentage =
    p.target_amount > 0
      ? Math.min(((p.current_amount ?? 0) / p.target_amount) * 100, 100)
      : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            뒤로가기
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={p.thumbnail_url || getYtThumb(p.id?.length ?? 0)}
                alt={p.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          p.status === "recruiting"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {p.status === "recruiting"
                          ? "모집중"
                          : p.status === "closed"
                            ? "마감"
                            : "완료"}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl">{p.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {p.description && (
                  <div>
                    <h3 className="mb-2 font-semibold">프로젝트 소개</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {p.description}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      예상 수익률
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {Number(p.yield_rate).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      최소 투자금액
                    </p>
                    <p className="text-2xl font-bold">
                      {(p.min_investment ?? 0).toLocaleString()}원
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      모집 진행률
                    </p>
                    <p className="font-semibold">
                      {progressPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {(p.current_amount ?? 0).toLocaleString()}원 모집됨
                    </span>
                    <span>
                      목표: {p.target_amount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Investment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>투자하기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      예상 수익률
                    </span>
                    <span className="text-xl font-bold text-red-500">
                      {Number(p.yield_rate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      최소 투자금액
                    </span>
                    <span className="font-semibold">
                      {(p.min_investment ?? 0).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {p.status === "recruiting" ? (
                  <InvestmentButton projectId={p.id} />
                ) : (
                  <Button disabled className="w-full" variant="secondary">
                    {p.status === "closed"
                      ? "모집 마감"
                      : "투자 불가"}
                  </Button>
                )}

                <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>• 투자는 원금 손실의 위험이 있습니다</p>
                  <p>• 과거 수익률이 미래 수익을 보장하지 않습니다</p>
                  <p>• 투자 전 상세 정보를 꼭 확인해주세요</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


