"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";


await supabase.auth.getSession();


export type KycStatus =
  | "not_started"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export function useKycStatus() {
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

      const raw = (data?.status as string | undefined) ?? undefined;
      const mapped: KycStatus =
        raw === "pending" ? "under_review" :
        raw === "submitted" ? "submitted" :
        raw === "approved" ? "approved" :
        raw === "rejected" ? "rejected" :
        "not_started";

      setStatus(mapped);
      setLoading(false);
    };

    fetchStatus();
  }, []);

  return { status, loading };
}
