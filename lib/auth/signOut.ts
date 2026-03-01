import { getBrowserSupabase } from '@/utils/supabase/client';

export async function signOutAndCleanup(redirectTo: string = '/') {
  try {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signOut error (ignored):', err);
  }

  try { localStorage.removeItem('hb_user'); } catch {}
  try { localStorage.removeItem('supabase.auth.token'); } catch {}
  try { sessionStorage.clear(); } catch {}

  if (typeof window !== 'undefined') {
    window.location.href = redirectTo;
  }
}
