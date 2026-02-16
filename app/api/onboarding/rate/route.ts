import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onboarding/rate - user_channel_ratings 저장
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { channel_id, score } = body;

    if (!channel_id || typeof score !== 'number' || score < 0 || score > 5) {
      return NextResponse.json({ error: 'channel_id, score(0-5) 필요' }, { status: 400 });
    }

    const { error } = await (supabase as any)
      .from('user_channel_ratings')
      .upsert(
        {
          user_id: user.id,
          channel_id,
          score: Math.round(score),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,channel_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
