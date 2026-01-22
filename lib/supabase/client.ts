import { createBrowserClient } from "@supabase/ssr";

export function createBrowserClientCompat() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Common singleton instance for client components
export const supabaseClient = createBrowserClientCompat();

// Backward-compat: some parts of the codebase still import `createClient`
export const createClient = createBrowserClientCompat;
