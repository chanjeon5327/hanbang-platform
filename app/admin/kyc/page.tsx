import { adminSupabase } from "@/lib/supabase/admin";

export default async function AdminKycPage() {
  const { data, error } = await adminSupabase
    .from("kyc_requests")
    .select("id, user_id, status, provider, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <pre>{error.message}</pre>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
