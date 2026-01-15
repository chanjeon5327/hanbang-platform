'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BottomNav from '@/components/mobile/BottomNav';
import { Wallet, MessageCircle, X } from 'lucide-react';
import { useKycStatus } from '@/lib/kyc/useKycStatus';

/**
 * ⚠️ products는 현재 임시 안전장치입니다.
 * 실제 데이터 연동 시 이 부분은 제거/대체하세요.
 */
const products: any[] = [];

export default function MobileHome() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 🔐 KYC 상태 (단일 진실)
  const { status: kycStatus, loading } = useKycStatus();

  /**
   * 상품 클릭 = 투자 의도
   * → 첫 투자 시 무조건 KYC
   */
  const handleProductClick = (productId: number) => {
    if (loading) return;

    if (kycStatus !== 'approved') {
      router.push('/kyc/start');
      return;
    }

    router.push(`/active-invest/product/${productId}`);
  };

  const notices = [
    { id: 1, title: '🎉 신규 가입자 대상 수수료 무료 이벤트' },
    { id: 2, title: '[점검] 서비스 안정화를 위한 서버 점검 안내' },
    { id: 3, title: 'KCP 리워드 정책이 일부 변경됩니다.' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-[90px] text-[#191F28]">

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-2 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-[#7c3aed]">HANBANG</h1>
        <button
          onClick={() => router.push('/login')}
          className="bg-gray-100 rounded-full text-sm px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 active:scale-95 transition-all"
        >
          로그인 / 회원가입
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="px-5 pt-32 flex flex-col gap-6">

        {/* 추천 상품 */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-bold">🔥 회원님을 위한 추천</h2>
            <Link
              href="/active-invest"
              className="text-sm text-gray-500 font-medium hover:text-black"
            >
              전체보기
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-6 -mx-5 px-5">
            {(products.length > 0 ? products : Array.from({ length: 5 })).map(
              (product: any, i: number) => (
                <div
                  key={i}
                  onClick={() => product && handleProductClick(product.id)}
                  className="min-w-[160px] w-[160px] cursor-pointer bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform"
                >
                  <div className="h-[160px] bg-gray-100 relative">
                    <Image
                      src={
                        product?.image ??
                        `https://source.unsplash.com/random/300x300/?kpop,concert&sig=${i}`
                      }
                      alt="product"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold truncate">
                      {product?.name ?? `가상의 상품 ${i + 1}`}
                    </div>
                    <span className="text-xs text-gray-500">
                      {product?.category ?? 'K-POP'}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* KYC 보조 버튼 (보험용) */}
        {kycStatus !== 'approved' && (
          <button
            onClick={() => router.push('/kyc/start')}
            className="w-full bg-[#191F28] text-white py-4 rounded-[20px] font-bold text-lg shadow-lg"
          >
            첫 투자를 위해 본인 인증이 필요해요
          </button>
        )}

        {/* 공지사항 */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold mb-4">공지사항</h2>
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id} className="text-sm text-gray-600">
                • {n.title}
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* 1:1 상담 플로팅 */}
      {isChatOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="fixed bottom-[170px] right-5 w-[300px] h-[400px] bg-white rounded-2xl shadow-xl z-50">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold">1:1 문의하기</h3>
              <button onClick={() => setIsChatOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-[100px] right-5 z-40"
      >
        <div className="w-[56px] h-[56px] bg-[#7c3aed] rounded-full text-white flex items-center justify-center">
          <MessageCircle size={20} />
        </div>
      </button>

      <BottomNav />
    </div>
  );
}
