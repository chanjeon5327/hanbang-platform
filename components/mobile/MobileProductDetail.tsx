'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { getYtThumb } from '@/lib/thumbnails';

type Product = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
  total_supply: number;
  remaining_supply: number;
};

export default function MobileProductDetail({ productId }: { productId: string }) {
  const supabase = createClient();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      setProduct(data as Product);
      setLoading(false);
    };

    load();
  }, [productId, supabase]);

  const handleBuy = async () => {
    if (!product) return;
    setBuying(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    // 1️⃣ 매수 실행
    const { error } = await supabase.rpc('rpc_invest', {
      p_product_id: product.id,
    });

    if (error) {
      alert(error.message);
      setBuying(false);
      return;
    }

    // 2️⃣ 방금 생성된 주문 조회 (가장 최신 1건)
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!order) {
      alert('주문 조회 실패');
      setBuying(false);
      return;
    }

    // 3️⃣ 성공 페이지 이동
    router.push(`/order/success?order_id=${order.id}`);
  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-400">로딩 중…</div>;
  }

  if (!product) {
    return <div className="p-6 text-center text-sm text-red-400">상품을 찾을 수 없습니다.</div>;
  }

  const soldOut = product.remaining_supply <= 0;

  const thumbSrc = product.thumbnail_url || getYtThumb(0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="relative w-full h-[360px]">
        <Image
          src={thumbSrc}
          alt={product.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="flex-1 px-5 py-6 space-y-4">
        <h1 className="text-xl font-bold">{product.title}</h1>

        <div className="text-sm text-gray-500">
          남은 수량 {product.remaining_supply} / {product.total_supply}
        </div>

        <div className="text-lg font-semibold">
          {product.price.toLocaleString()}원
        </div>

        {product.description && (
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {product.description}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 p-4 bg-white border-t">
        <button
          onClick={handleBuy}
          disabled={soldOut || buying}
          className={`w-full h-12 rounded-xl text-white font-semibold
            ${soldOut ? 'bg-gray-300' : 'bg-black'}
          `}
        >
          {soldOut ? '매진됨' : buying ? '매수 처리 중…' : '지금 매수'}
        </button>
      </div>
    </div>
  );
}
