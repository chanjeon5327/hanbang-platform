import { getAdminSupabase } from '@/utils/supabase/admin';

export { getAdminSupabase };
/** @deprecated Use getAdminSupabase() instead */
export const supabaseAdmin = getAdminSupabase();
