"use client";

import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase/client';
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
        console.error("??紐⑸줉 議고쉶 ?ㅽ뙣:", error);
        alert("異쒗뭹 紐⑸줉 議고쉶 ?ㅽ뙣");
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) return <div>濡쒕뵫 以?..</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>異쒗뭹 紐⑸줉</h2>

      {products.length === 0 && <p>異쒗뭹???곹뭹???놁뒿?덈떎.</p>}

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
            <div><strong>?곹뭹紐?</strong> {p.name}</div>
            <div><strong>媛寃?</strong> {p.price.toLocaleString()}??/div>
            <div style={{ fontSize: 12, color: "#666" }}>
              ?묒꽦?? {p.user_id}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

