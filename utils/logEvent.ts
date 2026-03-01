'use client';

import { getBrowserSupabase } from '@/utils/supabase/client';

const supabase = getBrowserSupabase();

export async function logEvent(
  event_type: string,
  payload?: Record<string, any>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from('ui_events').insert({
    user_id: user?.id ?? null,
    event_type,
    payload: payload ?? {},
  });
}
