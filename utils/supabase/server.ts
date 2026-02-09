// utils/supabase/server.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  // ✅ 서버 전용(Service Role) 클라이언트: RLS 우회 가능 (API Route에서만 사용)
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
