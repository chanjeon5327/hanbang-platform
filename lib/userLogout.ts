import { supabase } from "@/lib/supabaseClient";

export async function userLogout() {
  await supabase.auth.signOut();
}
