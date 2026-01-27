import { supabase } from '@/lib/supabase/client';
import { supabase } from './supabaseClient';

export async function isAuthenticated(): Promise<boolean> {
  const { data, error } = await supabase.auth.getSession();
  if (error) return false;
  return !!data.session;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}
