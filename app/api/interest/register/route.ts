import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { contentId, contactType, contactValue } = await req.json();

  const { error } = await supabase
    .from('interest_registrations')
    .insert({
      content_id: contentId,
      contact_type: contactType,
      contact_value: contactValue,
      push_enabled: contactType === 'phone',
    });

  // ✅ 이미 등록된 경우도 성공 처리
  if (error) {
    if (error.code === '23505') {
      // unique violation
      return NextResponse.json({
        success: true,
        duplicated: true,
      });
    }

    console.error('[INTEREST_REGISTER_ERROR]', error);
    return new NextResponse('server error', { status: 500 });
  }

  return NextResponse.json({ success: true });
}
