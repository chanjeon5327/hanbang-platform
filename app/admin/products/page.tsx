"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Product = {
  id: string;
  title: string;
  seller_id: string;
  status: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("id, title, seller_id, status")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }

    setLoading(false);
  };

  const updateStatus = async (
    productId: string,
    status: "approved" | "rejected"
  ) => {
    const { error } = await supabase
      .from("products")
      .update({
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .eq("id", productId);

    if (error) {
      alert("처리 실패");
      console.error(error);
      return;
    }

    fetchProducts(); // 즉시 갱신
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>관리자 상품 승인</h1>

      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>상품명</th>
            <th>판매자</th>
            <th>상태</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.seller_id}</td>
              <td>{p.status}</td>
              <td>
                {p.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(p.id, "approved")}
                    >
                      승인
                    </button>{" "}
                    <button
                      onClick={() => updateStatus(p.id, "rejected")}
                    >
                      반려
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
