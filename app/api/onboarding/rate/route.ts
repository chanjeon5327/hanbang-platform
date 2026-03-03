import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onboarding/rate - user_interest_ratings upsert
 * body: { channelId | channel_id | item_id, score (1-5) }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const itemId = body.item_id ?? body.channel_id ?? body.channelId ?? body.asset_id ?? body.id;
    const score = typeof body.score === 'number' ? body.score : Number(body.score);

    if (!itemId || typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json({ error: 'channelId/channel_id/item_id, score(1-5) 필요' }, { status: 400 });
    }

    const { error } = await (supabase as any)
      .from('user_interest_ratings')
      .upsert(
        {
          user_id: user.id,
          item_id: String(itemId),
          score: Math.round(score),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,item_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
