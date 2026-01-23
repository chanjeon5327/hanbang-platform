"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message); // ❌ 실패
      return;
    }

    // ✅ 성공분기 (여기!!)
    router.replace("/sell/new");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>로그인</h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      <button type="button" onClick={handleLogin}>
        로그인
      </button>
    </div>
  );
}
