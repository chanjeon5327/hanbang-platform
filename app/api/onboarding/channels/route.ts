import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onboarding/channels - 채널 목록 (3라운드 온보딩용)
 * ?limit=10&round=1 | ?limit=10&round=2&categories=여행,음악 | ?limit=10&round=3&categories=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get('limit') || '10', 10) || 10));
    const round = parseInt(searchParams.get('round') || '1', 10) || 1;
    const categoriesParam = searchParams.get('categories') || '';
    const preferredCategories = categoriesParam ? categoriesParam.split(',').map((c) => c.trim()).filter(Boolean) : [];

    const supabase = await getServerSupabase();
    let channels: Array<{ id: string; name: string; category?: string; thumbnail_url?: string; keywords?: string }> = [];

    const { data: rpcData, error: rpcError } = await (supabase as any)
      .rpc('get_random_onboarding_channels', { lim: 50 });

    if (!rpcError && rpcData && rpcData.length > 0) {
      channels = rpcData.map((r: { id: string; name: string; category?: string; thumbnail_url?: string; keywords?: string }) => ({
        id: r.id,
        name: r.name,
        category: r.category ?? undefined,
        thumbnail_url: r.thumbnail_url ?? undefined,
        keywords: r.keywords ?? undefined,
      }));
    } else {
      const { data, error } = await (supabase as any)
        .from('channels')
        .select('id, name, slug, category, thumbnail_url')
        .limit(50);

      if (!error && data && data.length > 0) {
        channels = data.map((r: { id: string; name: string; slug?: string; category?: string; thumbnail_url?: string }) => ({
          id: String(r.id),
          name: r.name,
          category: r.category ?? undefined,
          thumbnail_url: r.thumbnail_url ?? undefined,
        }));
      }
    }

    // 라운드 2/3: 선호 카테고리 기반 유사 채널 우선 (같은 category 포함)
    if (channels.length > 0 && preferredCategories.length > 0) {
      const preferred = channels.filter((c) => c.category && preferredCategories.includes(c.category));
      const others = channels.filter((c) => !c.category || !preferredCategories.includes(c.category));
      channels = [...preferred, ...others].sort(() => Math.random() - 0.5);
    } else {
      channels = [...channels].sort(() => Math.random() - 0.5);
    }

    return NextResponse.json({ channels: channels.slice(0, limit) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
