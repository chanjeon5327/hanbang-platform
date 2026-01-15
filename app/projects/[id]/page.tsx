import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, Play } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { InvestmentButton } from "@/components/InvestmentButton"

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

  const progressPercentage =
    project.target_amount > 0
      ? Math.min((project.current_amount / project.target_amount) * 100, 100)
      : 0

  const categoryLabels: Record<string, string> = {
    kpop: "K-POP",
    drama: "드라마",
    movie: "영화",
    youtube: "유튜브",
    webtoon: "웹툰",
    webnovel: "웹소설",
    other: "기타",
  }

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
            {/* Video/Thumbnail */}
            {project.video_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                <iframe
                  src={project.video_url}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : project.thumbnail_url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={project.thumbnail_url}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                <Play className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Project Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        {categoryLabels[project.category] || project.category}
                      </Badge>
                      <Badge
                        variant={
                          project.status === "recruiting"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {project.status === "recruiting"
                          ? "모집중"
                          : project.status === "closed"
                            ? "마감"
                            : "완료"}
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl">{project.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {project.description && (
                  <div>
                    <h3 className="mb-2 font-semibold">프로젝트 소개</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {project.description}
                    </p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      예상 수익률
                    </p>
                    <p className="text-2xl font-bold text-red-500">
                      {Number(project.yield_rate).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      최소 투자금액
                    </p>
                    <p className="text-2xl font-bold">
                      {project.min_investment.toLocaleString()}원
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
                      {project.current_amount.toLocaleString()}원 모집됨
                    </span>
                    <span>
                      목표: {project.target_amount.toLocaleString()}원
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
                      {Number(project.yield_rate).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      최소 투자금액
                    </span>
                    <span className="font-semibold">
                      {project.min_investment.toLocaleString()}원
                    </span>
                  </div>
                </div>

                {project.status === "recruiting" ? (
                  <InvestmentButton projectId={project.id} />
                ) : (
                  <Button disabled className="w-full" variant="secondary">
                    {project.status === "closed"
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


