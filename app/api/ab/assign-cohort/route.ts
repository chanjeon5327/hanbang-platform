import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok:true, cohort:'ANON' });

  // 최근 30일 활동 지표
  const { data: joins } = await supabase
    .from('join_funnel')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now()-30*24*60*60*1000).toISOString());

  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now()-30*24*60*60*1000).toISOString());

  let cohort:'NEW'|'ACTIVE'|'POWER' = 'NEW';
  if ((joins?.length ?? 0) >= 3) cohort = 'ACTIVE';
  if ((orders?.length ?? 0) >= 2) cohort = 'POWER';

  await supabase
    .from('user_cohorts')
    .upsert({ user_id: user.id, cohort }, { onConflict:'user_id' });

  return NextResponse.json({ ok:true, cohort });
}
