"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabaseClient } from '@/lib/supabase/client'

const supabase = supabaseClient

export default function LobbyPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 로그인 안 되어 있으면 홈으로
      if (!session?.user) {
        router.replace("/");
      }
    };

    checkSession();
  }, [router, supabase]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">로비</h1>
      <p>로그인 성공 후 진입한 페이지입니다.</p>
    </div>
  );
}
