import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/onboarding/channels - 채널 목록 (시드)
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from('channels')
      .select('id, name, slug, category, thumbnail_url')
      .order('name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ channels: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
