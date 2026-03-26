import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export const metadata = { title: '라운지 — HANBANG' };

const MOCK_ROOMS = [
  { id: 1, title: '블루웨이 시즌3 팬 라운지', members: 1240, badge: '🔥 인기' },
  { id: 2, title: '사운드 플로어 투자자 방',   members:  870, badge: '💬 활발' },
  { id: 3, title: '필름 하우스 커뮤니티',       members:  530, badge: null },
  { id: 4, title: '테이블 로그 투자 토론',      members:  310, badge: null },
];

export default function LoungePage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-10">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle size={20} className="text-[var(--hb-primary,#005AFF)]" />
            <span className="text-[13px] font-semibold text-[var(--hb-primary,#005AFF)]">라운지</span>
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-[-0.02em] text-[#0B1120]">
            인기 라운지
          </h1>
          <p className="mt-1.5 text-[14px] text-black/50">
            투자자와 팬이 함께 대화하는 공간입니다.
          </p>
        </div>

        {/* 라운지 목록 */}
        <div className="flex flex-col gap-3">
          {MOCK_ROOMS.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-black/[0.06] px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'var(--hb-primary-muted, rgba(0,90,255,0.08))' }}
                >
                  <MessageCircle size={18} className="text-[var(--hb-primary,#005AFF)]" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#0B1120]">{room.title}</p>
                  <p className="text-[12px] text-black/40 mt-0.5">{room.members.toLocaleString()}명 참여 중</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {room.badge && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#005AFF]">
                    {room.badge}
                  </span>
                )}
                <span className="text-[13px] text-black/30">준비 중</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-[13px] text-black/35">
          라운지 기능이 곧 오픈됩니다.{' '}
          <Link href="/" className="text-[var(--hb-primary,#005AFF)] hover:underline">
            홈으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  );
}
