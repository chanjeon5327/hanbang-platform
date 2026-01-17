"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type KycStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export function useKycStatus() {
  const supabase = createClient();
  const [status, setStatus] = useState<KycStatus>("not_started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("not_started");
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("kyc_verifications")
        .select("status")
        .eq("user_id", user.id)
        .single();

      setStatus((data?.status as KycStatus) ?? "not_started");
      setLoading(false);
    };

    fetchStatus();
  }, []);

  return { status, loading };
}
