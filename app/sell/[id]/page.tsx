"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  title: string | null;
  price: number;
  user_id: string;
};

export default function SellDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ 상품 조회 실패:", error);
        alert("상품을 불러오지 못했습니다");
      } else {
        setProduct(data);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}>로딩 중...</div>;
  if (!product) return <div style={{ padding: 24 }}>상품 없음</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>상품 상세</h2>

      <p><b>ID</b>: {product.id}</p>
      <p><b>상품명(name)</b>: {product.name}</p>
      <p><b>제목(title)</b>: {product.title ?? "(없음)"}</p>
      <p><b>가격</b>: {product.price.toLocaleString()}원</p>
      <p><b>판매자</b>: {product.user_id}</p>

      <hr />

      {/* A-6-2에서 여기에 버튼 붙임 */}
      <button type="button">구매 / 투자 (다음 단계)</button>
    </div>
  );
}
