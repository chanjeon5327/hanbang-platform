import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/utils/supabase/server';

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const body = await req.json();

  const { item_id, score } = body;

  if (!item_id || !score) {
    return NextResponse.json(
      { error: 'item_id and score required' },
      { status: 400 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('user_interest_ratings').insert({
    user_id: user.id,
    item_id,
    score,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
