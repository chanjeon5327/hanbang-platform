import { supabaseAdmin } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

type Order = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
};

export default async function AdminOrdersPage() {
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id,user_id,product_id,quantity,price,status,created_at')
    .order('created_at', { ascending: false });

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">
          구매 요청 목록 (관리자 / 판매자)
        </h1>
        현재 접수된 구매 요청이 없습니다.
      </div>
    );
  }

  const userIds = [...new Set(orders.map(o => o.user_id))];
  const productIds = [...new Set(orders.map(o => o.product_id))];

  const { data: users } = await supabaseAdmin
    .from('user_emails')
    .select('id,email')
    .in('id', userIds);

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id,title,available_supply')
    .in('id', productIds);

  const userMap = Object.fromEntries(
    (users ?? []).map(u => [u.id, u.email])
  );

  const productMap = Object.fromEntries(
    (products ?? []).map(p => [p.id, p])
  );

  async function completeOrder(order: Order) {
    'use server';

    const product = productMap[order.product_id];
    if (!product) return;

    // 1️⃣ 주문 체결
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        filled_quantity: order.quantity,
      })
      .eq('id', order.id);

    // 2️⃣ 재고 차감
    await supabaseAdmin
      .from('products')
      .update({
        available_supply:
          product.available_supply - order.quantity,
      })
      .eq('id', order.product_id);

    // 3️⃣ 화면 즉시 갱신
    revalidatePath('/admin/orders');
  }

  async function cancelOrder(orderId: string) {
    'use server';

    await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    revalidatePath('/admin/orders');
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        구매 요청 목록 (관리자 / 판매자)
      </h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">구매자</th>
            <th className="border p-2">상품</th>
            <th className="border p-2">가격</th>
            <th className="border p-2">수량</th>
            <th className="border p-2">상태</th>
            <th className="border p-2">액션</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td className="border p-2">
                {userMap[o.user_id] ?? '—'}
              </td>
              <td className="border p-2">
                {productMap[o.product_id]?.title ?? '—'}
              </td>
              <td className="border p-2">
                {o.price.toLocaleString()}원
              </td>
              <td className="border p-2">{o.quantity}</td>
              <td className="border p-2">{o.status}</td>
              <td className="border p-2 space-x-2">
                {o.status === 'pending' && (
                  <>
                    <form action={completeOrder.bind(null, o)}>
                      <button className="px-2 py-1 bg-green-600 text-white rounded">
                        체결
                      </button>
                    </form>
                    <form action={cancelOrder.bind(null, o.id)}>
                      <button className="px-2 py-1 bg-red-600 text-white rounded">
                        취소
                      </button>
                    </form>
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
