"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/context/UserAuthContext";

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔐 로그인 필수
  if (!loading && !user) {
    router.replace("/login");
    return null;
  }

  const handleSaveDraft = async () => {
    if (!user) return;
    if (!title || !category || price <= 0) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("products").insert({
      seller_id: user.id,
      status: "draft",
      title,
      category,
      price,
      description,
    });

    setSaving(false);

    if (error) {
      console.error(error);
      alert("출품 저장에 실패했습니다.");
      return;
    }

    // 👉 다음 단계: 판매자 출품 목록
    router.push("/seller/products");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">새 출품 등록</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">상품명</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="예: 웹툰 <나 혼자 만렙> 지분"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">카테고리</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="웹툰 / 음악 / 드라마"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">가격 (KRW)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
            placeholder="출품에 대한 설명을 입력하세요"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {saving ? "저장 중..." : "임시 저장"}
        </button>

        <button
          onClick={() => router.back()}
          className="border px-6 py-3 rounded-lg"
        >
          취소
        </button>
      </div>
    </div>
  );
}
