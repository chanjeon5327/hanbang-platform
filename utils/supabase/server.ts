// utils/supabase/server.ts — Next.js App Router
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * 로그인 세션 확인용 클라이언트.
 * - cookies() 기반으로 세션이 전달됨 (App Router)
 * - anon key 사용, RLS 적용
 * - Route Handler / Server Component 등에서 사용
 */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    throw new Error(`Supabase env required but empty: ${name}`);
  }
  return v;
}

export async function createClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component 등에서 set 불가 시 무시 (middleware에서 세션 갱신)
        }
      },
    },
  });
}

/**
 * DB 쓰기용 클라이언트 (Service Role).
 * - RLS 우회, 서버 전용
 * - 로그인 세션 없이 사용
 */
export function createAdminClient() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
