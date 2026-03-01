import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/lib/env';

export function getAdminSupabase() {
  return createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_SERVICE_ROLE_KEY
  );
}
