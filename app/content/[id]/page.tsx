'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import InterestRegisterModal from '@/components/interest/InterestRegisterModal';

export default function ContentDetailPage() {
  const params = useParams();
  const contentId = params?.id as string;

  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState(false);

  return (
    <main className="pb-24">

      {/* 썸네일 / 히어로 */}
      <section className="relative aspect-[16/9] bg-gray-200">
        <img
          src="https://source.unsplash.com/random/1200x675?creator,youtube"
          alt="content thumbnail"
          className="h-full w-full object-cover"
        />

        {/* 상태 배지 */}
        <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-xs text-white">
          모집중
        </span>
      </section>

      {/* 기본 정보 */}
      <section className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">
          유튜브 채널 &lt;여행가 제이&gt;
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          구독자 48만 · 여행 콘텐츠
        </p>

        {/* 한 줄 설명 */}
        <p className="mt-6 text-base text-gray-800">
          꾸준한 여행 콘텐츠로 광고 및 협찬 수익을 만들어온 채널입니다.
        </p>
      </section>

      {/* 상세 설명 */}
      <section className="mx-auto max-w-3xl px-4">
        <h2 className="mb-3 text-lg font-semibold">
          이 콘텐츠는 어떤 채널인가요
        </h2>

        <div className="space-y-4 text-sm text-gray-700">
          <p>
            &lt;여행가 제이&gt;는 국내외 여행지를 소개하는 콘텐츠를
            지속적으로 업로드해온 유튜브 채널입니다.
          </p>
          <p>
            실제 여행 경험을 바탕으로 한 영상 구성과 안정적인 업로드
            주기를 통해 고정 시청자층을 확보하고 있습니다.
          </p>
        </div>
      </section>

      {/* 수익 구조 */}
      <section className="mx-auto mt-10 max-w-3xl px-4">
        <h2 className="mb-3 text-lg font-semibold">
          수익은 이렇게 발생합니다
        </h2>

        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>유튜브 광고 수익</li>
          <li>브랜드 협찬 콘텐츠</li>
          <li>콘텐츠 라이선스</li>
        </ul>
      </section>

      {/* 참여 방식 */}
      <section className="mx-auto mt-10 max-w-3xl px-4">
        <h2 className="mb-3 text-lg font-semibold">
          참여 방식
        </h2>

        <p className="text-sm text-gray-700">
          이 콘텐츠는 수익권을 조각으로 나누어 참여할 수 있도록
          설계되어 있습니다. 현재는 정보 공개 단계이며,
          참여는 추후 오픈됩니다.
        </p>
      </section>

      {/* 하단 CTA */}
      <section className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <button
          disabled={registered}
          onClick={() => setOpen(true)}
          className={`mx-auto block w-full max-w-md rounded-xl py-3 text-center text-sm font-semibold ${
            registered
              ? 'bg-gray-300 text-gray-600'
              : 'bg-black text-white'
          }`}
        >
          {registered ? '관심 등록됨 ✓' : '관심 등록'}
        </button>

        <p className="mt-2 text-center text-xs text-gray-500">
          변경사항이 생기면 알려드릴게요
        </p>
      </section>

      {/* 관심 등록 모달 */}
      {open && (
        <InterestRegisterModal
          contentId={contentId}
          onClose={() => setOpen(false)}
          onSuccess={() => setRegistered(true)}
        />
      )}
    </main>
  );
}
