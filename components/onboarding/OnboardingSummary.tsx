'use client';

type Props = {
  ratedCount: number;
  skipped: boolean;
};

export default function OnboardingSummary({ ratedCount, skipped }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--royal-blue)', color: '#fff' }}
      >
        <span className="text-2xl">✓</span>
      </div>
      <h2 className="font-bold mb-2" style={{ fontSize: 20, color: 'var(--text)' }}>
        {skipped ? '건너뛰기 완료' : '취향 등록 완료'}
      </h2>
      <p className="body-sm text-center" style={{ color: 'var(--text-secondary)' }}>
        {skipped
          ? '나중에 마이페이지에서 취향을 등록할 수 있어요'
          : `${ratedCount}개 채널을 평가했어요. 맞춤 추천을 받아보세요!`}
      </p>
    </div>
  );
}
