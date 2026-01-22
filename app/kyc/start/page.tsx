/* app/kyc/start/page.tsx */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useKycStatus } from "@/lib/kyc/useKycStatus";

const supabase = supabaseClient;

export default function KycStartPage() {
  const router = useRouter();
  const { status, loading } = useKycStatus();
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const statusLabel = useMemo(() => {
    if (loading) return "확인 중…";
    if (status === "not_started") return "미진행";
    if (status === "submitted") return "제출 완료";
    if (status === "under_review") return "검토 중";
    if (status === "approved") return "승인 완료";
    return "반려";
  }, [loading, status]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user ?? null;
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);

      // 이미 승인 상태면 시작 화면을 거치지 않도록 처리
      if (!loading && status === "approved") {
        router.replace("/");
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, loading, status]);

  const handleStart = async () => {
    if (!userId) {
      router.replace("/login");
      return;
    }

    setSubmitting(true);

    // MVP: KYC 레코드가 없으면 생성하고, 있으면 submitted로 갱신 후 더미 verify 화면으로 이동
    const { data: existing, error: existingError } = await supabase
      .from("kyc_verifications")
      .select("id, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      console.error("KYC 상태 조회 실패:", existingError);
      alert("KYC 상태 확인 중 오류가 발생했습니다.");
      setSubmitting(false);
      return;
    }

    const submittedAt = new Date().toISOString();

    if (!existing) {
      const { error } = await supabase.from("kyc_verifications").insert({
        user_id: userId,
        status: "submitted",
        submitted_at: submittedAt,
      });

      if (error) {
        console.error("KYC 생성 실패:", error);
        alert("KYC 요청 생성에 실패했습니다.");
        setSubmitting(false);
        return;
      }
    } else if (existing.status !== "approved") {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({ status: "submitted", submitted_at: submittedAt })
        .eq("user_id", userId);

      if (error) {
        console.error("KYC 갱신 실패:", error);
        alert("KYC 요청 갱신에 실패했습니다.");
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    router.push("/kyc/verify");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-2">본인인증(KYC) 시작</h1>

      <p className="text-sm text-gray-600 mb-6">
        현재 상태: <span className="font-semibold">{statusLabel}</span>
      </p>

      <div className="space-y-3">
        <button
          onClick={handleStart}
          disabled={loading || submitting}
          className="w-full bg-black text-white py-4 rounded-xl disabled:opacity-50"
        >
          {submitting ? "요청 중…" : "KYC 진행하기"}
        </button>

        <button
          onClick={() => router.back()}
          className="w-full border py-4 rounded-xl"
        >
          뒤로가기
        </button>
      </div>
    </div>
  );
}
