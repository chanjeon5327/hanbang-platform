import { getServerSupabase } from '@/utils/supabase/server';

export { getServerSupabase };
/** @deprecated Use getServerSupabase instead */
export const createClient = getServerSupabase;
