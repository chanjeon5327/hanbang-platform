"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/context/UserAuthContext";

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);

  if (loading) return null;
  if (!user) {
    router.replace("/login");
    return null;
  }

  const submit = async () => {
    const { error } = await supabase.from("products").insert({
      seller_id: user.id,
      title,
      price,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/sell/my");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>출품하기</h2>

      <input
        placeholder="상품명"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: 12 }}
      />

      <input
        type="number"
        placeholder="가격"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        style={{ display: "block", marginBottom: 12 }}
      />

      <button onClick={submit}>출품 저장</button>
    </div>
  );
}
