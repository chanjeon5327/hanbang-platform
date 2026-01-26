"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUserAuth } from "@/context/UserAuthContext";

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  status: "draft" | "pending" | "approved" | "rejected";
  created_at: string;
};

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, loading } = useUserAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  // 🔐 로그인 필수
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // 📦 내 출품 조회
  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      setFetching(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, title, category, price, status, created_at")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      setFetching(false);

      if (error) {
        console.error(error);
        alert("출품 목록을 불러오지 못했습니다.");
        return;
      }

      setProducts(data ?? []);
    };

    fetchProducts();
  }, [user]);

  if (loading || fetching) {
    return <div className="p-6">불러오는 중...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">내 출품 목록</h1>

        <button
          onClick={() => router.push("/seller/products/new")}
          className="bg-black text-white px-4 py-2 rounded-lg font-bold"
        >
          + 새 출품
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-gray-500">
          아직 등록한 출품이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-bold">{p.title}</div>
                <div className="text-sm text-gray-500">
                  {p.category} · {p.price.toLocaleString()}원
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  상태:{" "}
                  <StatusBadge status={p.status} />
                </div>
              </div>

              <div className="flex gap-2">
                {p.status === "draft" && (
                  <button
                    onClick={() =>
                      router.push(`/seller/products/${p.id}/edit`)
                    }
                    className="border px-3 py-1 rounded-md text-sm"
                  >
                    수정
                  </button>
                )}

                {p.status === "pending" && (
                  <span className="text-sm text-gray-500">
                    승인 대기 중
                  </span>
                )}

                {p.status === "approved" && (
                  <span className="text-sm text-green-600 font-medium">
                    승인 완료
                  </span>
                )}

                {p.status === "rejected" && (
                  <span className="text-sm text-red-600 font-medium">
                    반려됨
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================
   상태 뱃지
===================== */

function StatusBadge({
  status,
}: {
  status: "draft" | "pending" | "approved" | "rejected";
}) {
  const map = {
    draft: "초안",
    pending: "승인 대기",
    approved: "승인됨",
    rejected: "반려",
  };

  const colorMap = {
    draft: "text-gray-600",
    pending: "text-yellow-600",
    approved: "text-green-600",
    rejected: "text-red-600",
  };

  return (
    <span className={`font-medium ${colorMap[status]}`}>
      {map[status]}
    </span>
  );
}
