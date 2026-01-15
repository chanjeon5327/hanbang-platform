'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/mobile/BottomNav';

export default function MobileHome() {
  const [isVisible, setIsVisible] = useState(true);

  // 공지사항 더미 데이터
  const notices = [
    { id: 1, title: '🎉 신규 가입자 대상 수수료 무료 이벤트' },
    { id: 2, title: '[점검] 서비스 안정화를 위한 서버 점검 안내' },
    { id: 3, title: 'KPC 리워드 정책이 일부 변경됩니다.' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-[85px]">
      <Header />
      
      <main className="px-5 pt-4 flex flex-col gap-4">
        
        {/* 1. KPC 및 자산 현황 */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6 cursor-pointer list-press rounded-lg p-1 -m-1">
            <span className="text-[#191F28] font-bold text-lg">KPC</span>
            <div className="flex items-center gap-1 text-gray-500 text-sm font-medium">
              쌓인 보너스 <span className="text-blue-600 font-bold ml-1">42 kpc</span>
              <span className="text-gray-300">›</span>
            </div>
          </div>

          <div className="mb-6">
             <div className="text-3xl font-bold text-[#191F28] mb-4">
                {isVisible ? '10,000,000 원' : '🙈 비공개'}
             </div>
             <div className="flex gap-2">
                <button className="flex-1 bg-[#3182F6] text-white py-3 rounded-[16px] font-bold btn-press">
                   채우기
                </button>
                <button className="flex-1 bg-[#E8F3FF] text-[#3182F6] py-3 rounded-[16px] font-bold btn-press">
                   보내기
                </button>
             </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="text-[#191F28] font-bold text-lg mb-4 flex justify-between">
               모든 자산 보기 <span className="text-gray-300 text-sm font-normal">편집</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
               <div className="bg-gray-50 rounded-2xl p-3 list-press">
                  <div className="text-gray-400 text-xs mb-1">채널</div>
                  <div className="font-bold text-lg">9</div>
               </div>
               <div className="bg-gray-50 rounded-2xl p-3 list-press">
                  <div className="text-gray-400 text-xs mb-1">웹툰</div>
                  <div className="font-bold text-lg">3</div>
               </div>
               <div className="bg-gray-50 rounded-2xl p-3 list-press">
                  <div className="text-gray-400 text-xs mb-1">웹소설</div>
                  <div className="font-bold text-lg">2</div>
               </div>
               <div className="bg-gray-50 rounded-2xl p-3 list-press">
                  <div className="text-gray-400 text-xs mb-1">음원</div>
                  <div className="font-bold text-lg">1</div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. 투자 등급 */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm flex items-center justify-between btn-press">
          <div>
            <div className="text-sm text-gray-500 font-bold mb-1">나의 투자 등급</div>
            <div className="text-2xl font-black text-[#191F28]">호랑이 등급 🐯</div>
            <div className="text-xs text-blue-500 mt-1 font-medium bg-blue-50 px-2 py-1 rounded inline-block">
               수수료 50% 우대 중
            </div>
          </div>
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-4xl">
            🐯
          </div>
        </section>

        {/* 3. 추천 상품 슬라이더 */}
        <section className="mt-2">
          <div className="flex justify-between items-end mb-4 px-1">
             <h2 className="text-xl font-bold text-[#191F28]">회원님을 위한 추천 상품</h2>
             <Link href="/invest/list" className="text-sm text-gray-400 btn-press">
               전체보기
             </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-6 snap-x scrollbar-hide -mx-5 px-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Link
                key={i}
                href={`/invest/product/${i}`}
                className="min-w-[150px] w-[150px] flex-shrink-0 bg-white rounded-[20px] overflow-hidden shadow-md snap-center btn-press"
              >
                <div className="h-[150px] bg-gray-200 relative">
                   <img src={`https://source.unsplash.com/random/300x300/?webtoon,poster&sig=${i}`} className="w-full h-full object-cover" />
                   {i < 3 && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">HOT</div>}
                </div>
                <div className="p-4">
                  <div className="text-sm font-bold text-gray-900 truncate mb-1">나 혼자 만렙 {i+1}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">웹툰</span>
                    <span className="text-red-500 font-bold text-sm">+{(12 + i * 1.2).toFixed(1)}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. 시장 동향 그래프 */}
        <section className="bg-white rounded-[24px] p-6 shadow-sm">
           <div className="flex justify-between items-end mb-4">
              <div>
                 <h2 className="text-lg font-bold text-[#191F28]">시장 동향</h2>
                 <p className="text-xs text-gray-400">K-콘텐츠 종합 지수 (K-CIX)</p>
              </div>
              <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg text-sm">▲ 2.4%</span>
           </div>
           <div className="h-[120px] w-full bg-gradient-to-t from-blue-50/50 to-transparent rounded-xl border-b border-blue-100 relative">
              <svg className="absolute bottom-0 left-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d="M0,100 C80,90 150,110 220,60 S300,20 380,10" fill="none" stroke="#3182F6" strokeWidth="3" strokeLinecap="round"/>
              </svg>
           </div>
        </section>
        
        {/* 5. KYC 버튼 */}
        <button className="w-full bg-[#191F28] text-white py-4 rounded-[20px] font-bold text-lg shadow-lg btn-press">
          KYC 인증하고 혜택 받기
        </button>

        {/* 6. 공지사항 (신규 추가) */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm mt-2">
          <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
            <h2 className="text-base font-bold text-[#191F28]">공지사항</h2>
            <button className="text-xs text-gray-400 font-bold">MORE ›</button>
          </div>
          <ul className="space-y-3">
            {notices.map((notice) => (
              <li key={notice.id} className="flex items-center gap-2 text-sm text-gray-600 list-press">
                <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                <span className="truncate">{notice.title}</span>
              </li>
            ))}
          </ul>
        </section>

      </main>

      {/* 1:1 상담 플로팅 버튼 (신규 추가) */}
      <button className="fixed bottom-[90px] right-5 z-50 flex flex-col items-center justify-center transition-transform active:scale-90 hover:scale-105">
        <div className="w-[52px] h-[52px] bg-[#3182F6] rounded-full shadow-lg shadow-blue-300/50 flex items-center justify-center text-2xl border-2 border-white">
          🙂
        </div>
        <span className="bg-white text-[#3182F6] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md -mt-2.5 z-10 border border-blue-100">
          1:1
        </span>
      </button>

      <BottomNav />
    </div>
  );
}
