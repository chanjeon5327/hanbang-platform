import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';
import { getAdminSupabase } from '@/utils/supabase/admin';

const BUCKET = 'creator-plans';
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPE = 'application/pdf';

export async function POST(request: Request) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const contentId = formData.get('content_id') as string | null;
    const strategySummary = (formData.get('strategy_summary') as string)?.trim() || null;
    const targetMarket = (formData.get('target_market') as string)?.trim() || null;
    const revenueModel = (formData.get('revenue_model') as string)?.trim() || null;
    const coreTeam = (formData.get('core_team') as string)?.trim() || null;
    const equipmentStack = (formData.get('equipment_stack') as string)?.trim() || null;
    const distributionPlan = (formData.get('distribution_plan') as string)?.trim() || null;

    if (!contentId?.trim()) {
      return NextResponse.json({ error: 'content_id가 필요합니다.' }, { status: 400 });
    }

    const hasFile = file && file instanceof File;
    const hasStrategy = strategySummary || targetMarket || revenueModel || coreTeam || equipmentStack || distributionPlan;

    if (!hasFile && !hasStrategy) {
      return NextResponse.json({ error: 'PDF 파일 또는 전략 정보가 필요합니다.' }, { status: 400 });
    }

    const admin = getAdminSupabase();
    let planPdfUrl: string | null = null;

    if (hasFile) {
      if (file.type !== ALLOWED_TYPE) {
        return NextResponse.json({ error: 'PDF 파일만 업로드 가능합니다.' }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });
      }

      const storagePath = `${contentId.trim()}/plan.pdf`;
      const { error: uploadErr } = await admin.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          contentType: ALLOWED_TYPE,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadErr) {
        return NextResponse.json({ error: `업로드 실패: ${uploadErr.message}` }, { status: 500 });
      }

      const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
      planPdfUrl = urlData.publicUrl;
    }

    const updatePayload: Record<string, string | null> = {
      strategy_summary: strategySummary,
      target_market: targetMarket,
      revenue_model: revenueModel,
      core_team: coreTeam,
      equipment_stack: equipmentStack,
      distribution_plan: distributionPlan,
    };
    if (planPdfUrl) {
      updatePayload.plan_pdf_url = planPdfUrl;
      updatePayload.creator_plan_pdf = planPdfUrl;
    }

    const { error: dbErr } = await admin
      .from('content_items')
      .update(updatePayload)
      .eq('id', contentId.trim());

    if (dbErr) {
      return NextResponse.json({ error: `저장 실패: ${dbErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, plan_pdf_url: planPdfUrl ?? undefined });
  } catch (e) {
    console.error('update-plan-pdf:', e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
