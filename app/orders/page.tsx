import { createClient } from '@/utils/supabase/server';

type OrderRow = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: string;
  created_at: string;
};

type ProductRow = {
  id: string;
  title: string | null;
};

export default async function MyOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-xl border p-6 text-center text-gray-600">
          로그인이 필요합니다.
        </div>
      </div>
    );
  }

  // 1) 내 주문만 (RLS 정석)
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id,product_id,quantity,price,status,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <div className="rounded-xl border p-6">
          <div className="text-lg font-bold mb-2">내 주문</div>
          <div className="text-sm text-red-600">
            주문 조회 실패: {error.message}
          </div>
        </div>
      </div>
    );
  }

  const orderRows = (orders ?? []) as OrderRow[];

  // 2) 상품명은 별도 조회 (관계 캐시/조인 이슈 원천 차단)
  const productIds = Array.from(new Set(orderRows.map(o => o.product_id)));
  const { data: products } =
    productIds.length > 0
      ? await supabase.from('products').select('id,title').in('id', productIds)
      : { data: [] as ProductRow[] };

  const productMap = new Map<string, string>();
  (products ?? []).forEach((p: any) => {
    productMap.set(p.id, p.title ?? '상품');
  });

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">내 주문</h1>
        <p className="text-sm text-gray-500 mt-1">
          체결/취소 상태와 주문 금액을 확인합니다.
        </p>
      </div>

      {orderRows.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center text-gray-500">
          아직 주문 내역이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {orderRows.map(o => {
            const title = productMap.get(o.product_id) ?? '상품';
            const total = (o.price ?? 0) * (o.quantity ?? 0);

            const badge =
              o.status === 'completed'
                ? 'bg-green-50 text-green-700 border-green-200'
                : o.status === 'cancelled'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200';

            return (
              <div
                key={o.id}
                className="rounded-2xl border p-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    수량 {o.quantity} · 단가 {Number(o.price).toLocaleString()}원
                  </div>
                </div>

                <div className="text-right shrink-0 ml-4">
                  <div className="text-lg font-bold">
                    {Number(total).toLocaleString()}원
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-1 text-xs border rounded-full mt-2 ${badge}`}
                  >
                    {o.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
