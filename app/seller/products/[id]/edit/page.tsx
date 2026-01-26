"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/context/UserAuthContext";

type Product = {
  id: string;
  seller_id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  status: "draft" | "pending" | "approved" | "rejected";
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const { user, loading } = useUserAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // 🔐 로그인 필수
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // 📦 출품 로드 + 권한 체크
  useEffect(() => {
    if (!user || !productId) return;

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error || !data) {
        alert("출품을 불러올 수 없습니다.");
        router.replace("/seller/products");
        return;
      }

      // ❌ 본인 출품 아님
      if (data.seller_id !== user.id) {
        alert("접근 권한이 없습니다.");
        router.replace("/seller/products");
        return;
      }

      setProduct(data);
    };

    fetchProduct();
  }, [user, productId, router]);

  if (loading || !product) {
    return <div className="p-6">불러오는 중...</div>;
  }

  // ❌ draft 외 수정 불가
  if (product.status !== "draft") {
    return (
      <div className="p-6">
        <p className="mb-4">이 출품은 수정할 수 없습니다.</p>
        <button
          onClick={() => router.push("/seller/products")}
          className="border px-4 py-2 rounded"
        >
          목록으로
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        title: product.title,
        category: product.category,
        price: product.price,
        description: product.description,
      })
      .eq("id", product.id);

    setSaving(false);

    if (error) {
      alert("저장에 실패했습니다.");
      return;
    }

    alert("임시 저장되었습니다.");
  };

  const handleRequestApproval = async () => {
    if (!confirm("승인을 요청하시겠습니까?")) return;

    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({ status: "pending" })
      .eq("id", product.id);

    setSaving(false);

    if (error) {
      alert("승인 요청에 실패했습니다.");
      return;
    }

    router.push("/seller/products");
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">출품 수정</h1>

      <div className="space-y-4">
        <input
          className="w-full border rounded-lg px-3 py-2"
          value={product.title}
          onChange={(e) =>
            setProduct({ ...product, title: e.target.value })
          }
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          value={product.category}
          onChange={(e) =>
            setProduct({ ...product, category: e.target.value })
          }
        />

        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2"
          value={product.price}
          onChange={(e) =>
            setProduct({
              ...product,
              price: Number(e.target.value),
            })
          }
        />

        <textarea
          className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
          value={product.description}
          onChange={(e) =>
            setProduct({
              ...product,
              description: e.target.value,
            })
          }
        />
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="border px-6 py-3 rounded-lg"
        >
          임시 저장
        </button>

        <button
          onClick={handleRequestApproval}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-lg font-bold"
        >
          승인 요청
        </button>
      </div>
    </div>
  );
}
