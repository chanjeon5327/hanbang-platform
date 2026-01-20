import { createClient } from "@supabase/supabase-js";

/**
 * ✅ 브라우저 / 클라이언트 전용
 */
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
