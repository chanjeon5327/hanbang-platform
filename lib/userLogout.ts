"use client";

import { supabase } from "@/lib/supabase/client";

export async function userLogout() {
  await supabaseClient.auth.signOut();
}
