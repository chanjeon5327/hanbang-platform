"use client";

import { supabaseClient } from "@/lib/supabase/client";

export async function userLogout() {
  await supabaseClient.auth.signOut();
}
