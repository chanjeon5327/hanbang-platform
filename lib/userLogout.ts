"use client";

import { supabase } from "@/lib/supabase";

export async function userLogout() {
  await supabase.auth.signOut();
}
