import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[debug-session] user', user ?? null);
  return NextResponse.json({ user: user ?? null });
}
