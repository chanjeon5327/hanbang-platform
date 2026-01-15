'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BottomNav from '@/components/mobile/BottomNav';
import { useStore } from '@/context/StoreContext';
import { Eye, EyeOff, ChevronRight, Wallet, MessageCircle, X } from 'lucide-react';

export default function MobileHome() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { products, isLoggedIn } = useStore(); 

  const notices = [
    { id: 1, title: '🎉 신규 가입자 대상 수수료 무료 이벤트' },
    { id: 2, title: '[점검] 서비스 안정화를 위한 서버 점검 안내' },
    { id: 3, title: 'KCP 리워드 정책이 일부 변경됩니다.' },
  ];

  return (
    // [배경색 변경] 블랙 -> 연한 회색 (#F2F4F6)
    <div className="min-h-screen bg-[#F2F4F6] pb-[90px] text-[#191F28]">
      
      {/* 상단 헤더 (화이트 + 블러 효과) */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-2 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-[#7c3aed]">HANBANG</h1>
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            // CASE A: 비로그인 상태 - 로그인/회원가입 버튼
            <button
              onClick={() => router.push('/login')}
              className="bg-gray-100 rounded-full text-sm px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 active:scale-95 transition-all"
            >
              로그인/회원가입
            </button>
          ) : (
            // CASE B: 로그인 상태 - 지갑 아이콘 + 프로필 이미지
            <>
              <Link href="/wallet" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all">
                <Wallet className="w-4 h-4 text-gray-700" />
              </Link>
              <Link href="/mypage" className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 hover:border-gray-300 active:scale-95 transition-all">
                <Image
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                  alt="프로필"
                  fill
                  className="object-cover"
                />
              </Link>
            </>
          )}
        </div>
      </header>
      
      {/* 메인 콘텐츠 */}
      <main className="px-5 pt-32 flex flex-col gap-4">
        
        {/* 1. 자산 현황 카드 (화이트 박스) */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 cursor-pointer rounded-lg -m-1 p-1 hover:bg-gray-50 transition-colors">
            {/* [유지] 내 자산 (KRW) */}
            <span className="text-[#333] font-bold text-lg">내 자산 (KRW)</span>
            
            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
              {/* [유지] KCP 표기 */}
              쌓인 보너스 <span className="text-[#7c3aed] font-bold ml-1">42 KCP</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="mb-6">
             <div className="flex items-center gap-2 mb-4">
                 <div className="text-3xl font-bold text-[#191F28] tracking-tight">
                    {isVisible ? '10,000,000 원' : '🙈 비공개'}
                 </div>
                 <button onClick={() => setIsVisible(!isVisible)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                 </button>
             </div>
             <div className="flex gap-3">
                {/* 버튼 디자인: 그림자 줄이고 깔끔하게 */}
                <button className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-3.5 rounded-[16px] font-bold transition-all active:scale-95 shadow-md shadow-purple-200">
                   채우기
                </button>
                <button className="flex-1 bg-[#E8F3FF] hover:bg-[#dbeafe] text-[#7c3aed] py-3.5 rounded-[16px] font-bold transition-all active:scale-95">
                   보내기
                </button>
             </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="text-[#333] font-bold text-lg mb-4 flex justify-between items-center">
               모든 자산 <span className="text-gray-500 text-sm font-normal bg-gray-100 px-3 py-1 rounded-full">편집</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
               {['채널', '웹툰', '웹소설', '음원'].map((item, idx) => (
                   <div key={item} className="bg-gray-50 rounded-2xl p-3 active:bg-gray-100 transition-colors">
                      <div className="text-gray-500 text-xs mb-1">{item}</div>
                      <div className="font-bold text-lg text-[#333]">{[9, 3, 2, 1][idx]}</div>
                   </div>
               ))}
            </div>
          </div>
        </section>

        {/* 2. 투자 등급 */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer">
          <div>
            <div className="text-sm text-gray-500 font-bold mb-1">나의 투자 등급</div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-black text-[#191F28]">호랑이 등급 🐯</div>
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[#191F28] text-white font-bold text-xs">
                Lv.5
              </div>
            </div>
            <div className="text-xs text-[#7c3aed] font-bold bg-[#7c3aed]/10 px-2.5 py-1 rounded inline-block">
               수수료 50% 우대 중
            </div>
          </div>
        </section>

        {/* 3. 추천 상품 슬라이더 */}
        <section className="mt-2">
          <div className="flex justify-between items-end mb-4 px-1">
             <h2 className="text-xl font-bold text-[#191F28]">🔥 회원님을 위한 추천</h2>
             <Link href="/active-invest" className="text-sm text-gray-500 font-medium hover:text-black transition-colors">
               전체보기
             </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x scrollbar-hide -mx-5 px-5">
            {(products.length > 0 ? products : Array.from({ length: 5 })).map((product: any, i: number) => (
              <Link
                key={i}
                href={product ? `/active-invest/product/${product.id}` : '#'}
                className="min-w-[160px] w-[160px] flex-shrink-0 bg-white rounded-[20px] overflow-hidden shadow-sm border border-gray-100 snap-center active:scale-95 transition-transform"
              >
                <div className="h-[160px] bg-gray-100 relative">
                   <Image 
                     src={product?.image || `https://source.unsplash.com/random/300x300/?kpop,concert&sig=${i}`} 
                     alt="product"
                     fill
                     className="object-cover"
                   />
                   {i < 3 && <div className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">HOT</div>}
                </div>
                <div className="p-4">
                  <div className="text-sm font-bold text-[#191F28] truncate mb-1">
                    {product?.name || `가상의 상품 ${i+1}`}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{product?.category || 'K-POP'}</span>
                    <span className="text-[#ef4444] font-bold text-sm">
                        {product ? '+15.5%' : `+${(12 + i * 1.2).toFixed(1)}%`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. 시장 동향 그래프 */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
           <div className="flex justify-between items-end mb-4">
             <div>
                 <h2 className="text-lg font-bold text-[#191F28]">시장 동향</h2>
                 <p className="text-xs text-gray-500 mt-1">K-콘텐츠 종합 지수 (K-CIX)</p>
             </div>
             <span className="text-[#ef4444] font-bold bg-[#ef4444]/10 px-2.5 py-1 rounded-lg text-sm">▲ 2.4%</span>
           </div>
           <div className="h-[120px] w-full bg-gradient-to-t from-[#7c3aed]/5 to-transparent rounded-xl border-b border-[#7c3aed]/20 relative overflow-hidden">
             <svg className="absolute bottom-0 left-0 w-full h-full overflow-visible" preserveAspectRatio="none">
               <path d="M0,100 C80,90 150,110 220,60 S300,20 380,10" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"/>
             </svg>
           </div>
        </section>
        
        {/* 5. KYC 버튼 (블랙 반전 -> 진한 네이비) */}
        <button className="w-full bg-[#191F28] text-white hover:bg-black py-4 rounded-[20px] font-bold text-lg shadow-lg active:scale-[0.98] transition-all">
          KYC 인증하고 혜택 받기
        </button>

        {/* 6. 공지사항 */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mt-2 mb-4">
          <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
            <h2 className="text-base font-bold text-[#191F28]">공지사항</h2>
            <button className="text-xs text-gray-400 font-bold hover:text-gray-600">MORE ›</button>
          </div>
          <ul className="space-y-4">
            {notices.map((notice) => (
              <li key={notice.id} className="flex items-center gap-3 text-sm text-gray-600 active:text-black transition-colors">
                <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                <span className="truncate">{notice.title}</span>
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* 1:1 상담 플로팅 버튼 */}
      {/* 채팅창 */}
      {isChatOpen && (
        <>
          {/* 배경 레이어 (클릭 시 닫기) */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsChatOpen(false)}
          />
          {/* 채팅창 */}
          <div className="fixed bottom-[170px] right-5 w-[300px] h-[400px] bg-white rounded-2xl shadow-xl flex flex-col z-50">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-[#191F28]">1:1 문의하기</h3>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* 본문 */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-gray-100 rounded-2xl p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    안녕하세요! 무엇을 도와드릴까요?
                  </p>
                </div>
              </div>
              
              {/* 입력창 */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-0"
                    readOnly
                  />
                </div>
              </div>
            </div>
        </>
      )}
      
      {/* 플로팅 버튼 */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-[100px] right-5 z-40 flex flex-col items-center justify-center transition-transform active:scale-90 hover:scale-105"
      >
        <div className="w-[56px] h-[56px] bg-[#7c3aed] rounded-full shadow-lg shadow-purple-500/40 flex flex-col items-center justify-center text-white border-2 border-white">
          <MessageCircle size={20} fill="white" className="mb-0.5" />
          <span className="text-[10px] font-bold leading-none">1:1</span>
        </div>
      </button>

      <BottomNav />
    </div>
  );
}