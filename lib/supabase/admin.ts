import { createClient } from "@supabase/supabase-js";

/**
 * ✅ 서버(API route) 전용
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
