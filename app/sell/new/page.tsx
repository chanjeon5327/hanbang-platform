"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SellNewPage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    // 1️⃣ 현재 로그인 세션 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("로그인이 필요합니다");
      setLoading(false);
      return;
    }

    // 2️⃣ products 테이블에 실제 존재하는 컬럼만 INSERT
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: title,   // 🔴 이 1줄이 핵심 (부수)
          title,
          price,
          user_id: user.id,
        },
      ])
      
      .select()
      .single();

    if (error) {
      console.error("❌ 출품 실패:", error);
      alert("출품 실패: " + error.message);
    } else {
      console.log("✅ 출품 성공:", data);
      alert("출품 성공");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>출품하기</h2>

      <input
        placeholder="상품명"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />

      <input
        type="number"
        placeholder="가격"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        style={{ display: "block", marginBottom: 8 }}
      />

      <button type="button" onClick={handleSubmit} disabled={loading}>
        {loading ? "저장 중..." : "출품 저장"}
      </button>
    </div>
  );
}
