'use client';

import { useParams } from 'next/navigation';
import MobileProductDetail from '@/components/mobile/MobileProductDetail';

export default function SellProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  if (!productId) {
    return (
      <div className="p-6 text-center text-sm text-red-400">
        잘못된 접근입니다.
      </div>
    );
  }

  return <MobileProductDetail productId={productId} />;
}
