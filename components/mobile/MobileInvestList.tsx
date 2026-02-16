'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';

export default function MobileInvestList() {
  const router = useRouter();
  
  // 더미 데이터 생성 (20개)
  const products = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    title: i % 2 === 0 ? '전지적 독자 시점 웹툰 지분 투자' : '유튜브 채널 <여행가 제이> 수익권',
    summary: i % 2 === 0 ? '글로벌 3억 뷰 달성 예정 대작' : '구독자 50만 달성 임박 채널',
    investors: 1200 + i * 15,
    investee: i % 2 === 0 ? '박태준 만화회사' : '크리에이터 제이',
    image: getYtThumb(i),
    badge: i < 5 ? '마감임박' : ''
  }));

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <header className="sticky top-0 bg-white z-50 px-4 h-[50px] flex items-center justify-between border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 text-slate-800 btn-press"><ArrowLeft size={26} strokeWidth={2} /></button>
        <h1 className="text-lg font-bold text-slate-800">투자 상품 전체</h1>
        <button className="p-2 text-slate-800 btn-press"><Search size={26} strokeWidth={2} /></button>
      </header>

      {/* 필터 탭 (옵션) */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide border-b border-gray-50 mb-4">
        {['전체', '웹툰', '유튜브', '영화', '드라마', '전시'].map((cat, idx) => (
          <button key={cat} className={`px-3 py-1.5 text-sm rounded-full border btn-press ${idx === 0 ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* 2열 그리드 리스트 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-4 pb-20">
        {products.map((item) => (
          <Link
            key={item.id}
            href={`/invest/product/${item.id}`}
            className="flex flex-col cursor-pointer active:opacity-90 transition-transform list-press"
          >
            {/* 이미지 영역 */}
            <div className="relative w-full aspect-[4/5] bg-gray-100 rounded-[16px] overflow-hidden mb-3 shadow-sm">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              {item.badge && (
                <div className="absolute top-0 left-0 bg-red-500 text-white caption font-bold px-3 py-1.5 rounded-br-[16px]">
                  {item.badge}
                </div>
              )}
              {/* 찜 하트 버튼 (이미지 우측 하단) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="absolute bottom-3 right-3 w-9 h-9 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl border border-white/10 btn-press z-10"
              >
                ♡
              </button>
            </div>

            {/* 텍스트 정보 (크기 확대 적용) */}
            <div className="px-1">
              <h3 className="text-[#191F28] font-bold h3 leading-snug line-clamp-2 mb-1.5 tracking-tight">
                {item.title}
              </h3>
              <p className="text-gray-500 body-sm truncate mb-3 font-medium">
                {item.summary}
              </p>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                {/* 귀여운 아이콘 + 투자자 수 */}
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span className="text-blue-600 font-bold body-sm">
                    {item.investors.toLocaleString()}명
                  </span>
                </div>
                
                {/* 투자 받는 사람 */}
                <span className="text-gray-400 font-medium body-sm flex items-center gap-1">
                  To. <span className="text-gray-600">{item.investee}</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

