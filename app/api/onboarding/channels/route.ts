import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onboarding/channels - 채널 목록 (onboarding_channels 또는 mock)
 * onboarding_channels가 비어있으면 빈 배열 반환 → 프론트 mock 사용
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: rpcData, error: rpcError } = await (supabase as any)
      .rpc('get_random_onboarding_channels', { lim: 50 });

    if (!rpcError && rpcData && rpcData.length > 0) {
      const channels = rpcData.map((r: { id: string; name: string; category?: string; thumbnail_url?: string }) => ({
        id: r.id,
        name: r.name,
        category: r.category ?? undefined,
        thumbnail_url: r.thumbnail_url ?? undefined,
      }));
      return NextResponse.json({ channels });
    }

    // RPC 실패 또는 테이블 비어있음 → 기존 channels 테이블 fallback
    const { data, error } = await (supabase as any)
      .from('channels')
      .select('id, name, slug, category, thumbnail_url')
      .limit(50);

    if (!error && data && data.length > 0) {
      const channels = data.map((r: { id: string; name: string; slug?: string; category?: string; thumbnail_url?: string }) => ({
        id: String(r.id),
        name: r.name,
        slug: r.slug,
        category: r.category ?? undefined,
        thumbnail_url: r.thumbnail_url ?? undefined,
      }));
      const shuffled = [...channels].sort(() => Math.random() - 0.5);
      return NextResponse.json({ channels: shuffled.slice(0, 50) });
    }

    return NextResponse.json({ channels: [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
