"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  title: string | null;
  price: number;
  user_id: string;
  created_at: string;
};

export default function SellListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ 목록 조회 실패:", error);
        alert("출품 목록 조회 실패");
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>출품 목록</h2>

      {products.length === 0 && <p>출품된 상품이 없습니다.</p>}

      {products.map((p) => (
        <Link key={p.id} href={`/sell/${p.id}`}>
          <div
            style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 8,
              cursor: "pointer",
            }}
          >
            <div><strong>상품명:</strong> {p.name}</div>
            <div><strong>가격:</strong> {p.price.toLocaleString()}원</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              작성자: {p.user_id}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
