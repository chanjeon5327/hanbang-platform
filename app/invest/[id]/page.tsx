'use client';

import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/context/ToastContext';

export default function InvestPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();

  const handleBuy = async () => {
    // ✅ 1. orders 생성
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        product_id: productId,
        price: 100000,
        quantity: 1,
        status: 'completed',
      })
      .select()
      .single();

    if (error || !order) {
      toast('주문 생성 실패');
      return;
    }

    // ✅ 2. orders.id만 success 페이지로 전달
    router.push(`/order/success?order_id=${order.id}`);
  };

  return (
    <div className="p-6">
      <button
        onClick={handleBuy}
        className="w-full h-12 bg-black text-white rounded-xl"
      >
        매수하기
      </button>
    </div>
  );
}
