// components/mobile/MobileHome.tsx

'use client';

import { useRouter } from 'next/navigation';

export default function MobileHome() {
  const router = useRouter();

  return (
    <div className="space-y-4 px-4 py-6">
      {/* 🔹 자산 요약 섹션 (카드 제거, 진입 버튼만 유지) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">내 자산</p>
            <p className="text-base font-semibold text-gray-900">
              지갑에서 확인하세요
            </p>
          </div>
          <button
            onClick={() => router.push('/wallet')}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            지갑으로 이동
          </button>
        </div>
      </div>

      {/* 🔹 이하 기존 홈 콘텐츠 유지 */}
      {/* 예: 인기 프로젝트, 추천 채널 등 */}
    </div>
  );
}
