import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';
import { getAdminSupabase } from '@/utils/supabase/admin';

export const runtime = 'nodejs';

/** GET /api/reco/personalized - 로그인 유저의 개인화 추천 item_ids (user_taste_score 기반) */
export async function GET(req: NextRequest) {
  try {
    const supabase = await getServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: true, note: 'anon', items: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const url = new URL(req.url);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') ?? 20)));

    const admin = getAdminSupabase();
    const { data: rows, error } = await admin
      .from('user_taste_score')
      .select('item_id')
      .eq('user_id', user.id)
      .order('taste_score', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { ok: true, note: 'no-data', items: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const items = (rows ?? [])
      .map((r) => r.item_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    const note = items.length > 0 ? 'personalized' : 'no-data';

    return NextResponse.json(
      { ok: true, note, items },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
