import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, product_id, price } = body;

    if (!user_id || !product_id || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('content_usage_logs')
      .insert({
        user_id,
        product_id,
        price,
        created_at: new Date().toISOString(),
      });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
