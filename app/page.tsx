"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (!data.session?.user) {
        router.replace("/login");
      }
    };
    check();
  }, [router]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">홈 콘텐츠 영역</h1>
      <p>이제 레이아웃과 헤더는 정상입니다.</p>
    </div>
  );
}
