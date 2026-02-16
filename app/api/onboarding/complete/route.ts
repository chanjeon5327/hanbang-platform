import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onboarding/complete - 온보딩 완료 (건너뛰기 포함)
 * - user_taste_profile 저장
 * - profiles.status → ACTIVE
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { skipped, summary } = body;

    // user_taste_profile upsert
    const summaryData = typeof summary === 'object' ? summary : {};
    await (supabase as any)
      .from('user_taste_profile')
      .upsert(
        {
          user_id: user.id,
          summary: summaryData,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    // profiles.status → ACTIVE
    await (supabase as any)
      .from('profiles')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({ ok: true, status: 'ACTIVE' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
