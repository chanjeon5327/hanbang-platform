import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { redirect } from "next/navigation"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  // 인증 확인
  const { data: { session }, error } = await supabase.auth.getSession()
  const user = session?.user ?? null

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다" },
      { status: 401 }
    )
  }

  // 프로젝트 확인
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (projectError || !project) {
    return NextResponse.json(
      { error: "프로젝트를 찾을 수 없습니다" },
      { status: 404 }
    )
  }

  const p = project as { status?: string }
  if (p.status !== "recruiting") {
    return NextResponse.json(
      { error: "모집 중인 프로젝트가 아닙니다" },
      { status: 400 }
    )
  }

  // TODO: 실제 투자 로직 구현
  // 여기서는 투자 페이지로 리다이렉트
  redirect(`/projects/${id}/invest/confirm`)
}

