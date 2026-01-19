"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useUserAuth } from "@/context/UserAuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ 이미 로그인 상태면 홈으로 보내기
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const handleLogin = async () => {
    if (!email) {
      setMessage("이메일을 입력해 주세요.");
      return;
    }

    setSending(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("로그인 링크를 이메일로 전송했습니다.");
    }

    setSending(false);
  };

  // 로딩 중이거나 이미 로그인 상태면 화면 숨김
  if (loading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-xl font-bold text-center">
          HANBANG 로그인
        </h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-full rounded border px-3 py-2 mb-3"
        />

        <button
          onClick={handleLogin}
          disabled={sending}
          className="w-full rounded bg-black py-2 text-white disabled:opacity-50"
        >
          {sending ? "전송 중..." : "이메일로 로그인"}
        </button>

        {message && (
          <p className="mt-3 text-center text-sm text-gray-600">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
