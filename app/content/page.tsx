import Link from 'next/link';
import { Play } from 'lucide-react';

export const metadata = { title: '콘텐츠 — HANBANG' };

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Play size={20} className="text-[var(--hb-primary,#005AFF)]" />
            <span className="text-[13px] font-semibold text-[var(--hb-primary,#005AFF)]">콘텐츠</span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#0B1120]">
            크리에이터 콘텐츠
          </h1>
          <p className="mt-1.5 text-[14px] text-black/50">
            투자한 크리에이터의 최신 콘텐츠를 확인하세요.
          </p>
        </div>

        {/* 준비 중 안내 */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-12 flex flex-col items-center text-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--hb-primary-muted, rgba(0,90,255,0.08))' }}
          >
            <Play size={28} className="text-[var(--hb-primary,#005AFF)]" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-[#0B1120]">콘텐츠 서비스 준비 중</p>
            <p className="mt-1 text-[13px] text-black/50">
              크리에이터 콘텐츠 피드가 곧 오픈됩니다.
            </p>
          </div>
          <Link
            href="/market"
            className="mt-2 px-5 py-2.5 rounded-full text-[14px] font-semibold text-white"
            style={{ backgroundColor: 'var(--hb-primary, #005AFF)' }}
          >
            마켓 둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}
