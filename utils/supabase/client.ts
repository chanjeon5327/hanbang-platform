import { createBrowserClient } from '@supabase/ssr';
import { ENV } from '@/lib/env';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserSupabase() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      ENV.NEXT_PUBLIC_SUPABASE_URL,
      ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}
