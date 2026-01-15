'use client';
import MobileProductDetail from '@/components/mobile/MobileProductDetail';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // params.id를 안전하게 처리
  const productId = params?.id || '1';
  return <MobileProductDetail id={productId} />;
}

