import { createBrowserClient } from '@supabase/ssr'

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || String(v).trim() === "") {
    throw new Error(`Supabase env required but empty: ${name}`);
  }
  return v;
}

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  client = createBrowserClient(url, anonKey);

  return client
}
