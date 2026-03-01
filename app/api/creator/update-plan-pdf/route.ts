import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const { content_id, creator_plan_pdf } = await request.json();
    if (!content_id || !creator_plan_pdf) {
      return NextResponse.json({ error: 'content_id, creator_plan_pdf 필요' }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    const { error } = await supabase
      .from('content_items')
      .update({ creator_plan_pdf })
      .eq('id', content_id);

    if (error) {
      console.error('update creator_plan_pdf:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
