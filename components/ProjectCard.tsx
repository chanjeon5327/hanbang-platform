"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase/types"
import { ArrowRight, TrendingUp } from "lucide-react"
import Image from "next/image"
import { LoginModal } from "@/components/auth/LoginModal"
import { supabaseClient } from "@/lib/supabase/client"

type Project = Database["public"]["Tables"]["projects"]["Row"]

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const supabase = supabaseClient

  const handleInvestClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const { data: { session }, error } = await supabase.auth.getSession()
    const user = session?.user ?? null

    if (!user) {
      setIsLoginModalOpen(true)
    } else {
      window.location.href = `/projects/${project.id}`
    }
  }
  const progressPercentage = project.target_amount && project.target_amount > 0
    ? Math.min(((project.current_amount || 0) / project.target_amount) * 100, 100)
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
    <>
      <Card className="group h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer rounded-3xl border-none shadow-md">
        <Link href={`/projects/${project.id}`}>
          <div className="relative aspect-video w-full overflow-hidden rounded-t-3xl">
            {project.thumbnail_url ? (
              <Image
                src={project.thumbnail_url}
                alt={project.title}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge variant="secondary">
                {categoryLabels[project.category] || project.category}
              </Badge>
            </div>
          </div>

          <CardHeader>
            <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            {project.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">예상 수익률</span>
              <span className="text-2xl font-bold text-red-500">
                {Number(project.yield_rate).toFixed(1)}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">모집 진행률</span>
                <span className="font-medium">
                  {progressPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {(project.current_amount || 0).toLocaleString()}원 /{" "}
                  {(project.target_amount || 0).toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">최소 투자금액</span>
              <span className="font-semibold">
                {(project.min_investment || 10000).toLocaleString()}원
              </span>
            </div>
          </CardContent>
        </Link>

        <CardFooter>
          <Button
            className="w-full"
            variant="default"
            onClick={handleInvestClick}
          >
            투자하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <LoginModal
        open={isLoginModalOpen}
        onOpenChange={setIsLoginModalOpen}
      />
    </>
  )
}

