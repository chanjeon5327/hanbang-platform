import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const SIM_RESET_KRW = 10_000_000;

export async function POST() {
  const simMode = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true';
  if (!simMode) {
    return NextResponse.json({ error: 'SIMULATION_MODE_DISABLED' }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('rpc_sim_reset', {
    p_user_id: user.id,
    p_amount_krw: SIM_RESET_KRW,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    amount_krw: SIM_RESET_KRW,
    entry_id: (data as { entry_id?: string })?.entry_id,
  });
}
