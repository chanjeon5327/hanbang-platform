import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/user/status - 현재 유저의 profiles.status 반환
 * 라우팅 가드에서 사용
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ status: null }, { status: 401 });
    }

    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      status: profile?.status ?? 'NEW',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
