import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ENV } from '@/lib/env';

export async function getServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    ENV.NEXT_PUBLIC_SUPABASE_URL,
    ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
