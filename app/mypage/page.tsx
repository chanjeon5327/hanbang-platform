import Link from 'next/link';

export default function MyPage() {
  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="mx-auto w-full max-w-[980px]">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">내 방</h1>
            <p className="mt-1 text-sm text-slate-600">
              내 자산에 환영합니다. 자산을 불러오는 중입니다.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href="/onboarding" className="rounded-xl border px-3 py-2 text-sm font-bold hover:bg-slate-50">
              나의 취향 등록
            </Link>
            <Link href="/market" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-extrabold text-white">
              마켓
            </Link>
          </div>
        </header>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card title="내 자산" value="₩0" sub="지금부터 콘텐츠 부자가 되세요." />
          <Card title="보유 조각" value="0개" sub="온보딩 후 추천을 받아보세요." />
          <Card title="예상 배당" value="₩0" sub="보유하면 수익이 들어오는 구조" />
        </div>

        {/* Level */}
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold">회원 등급</div>
              <div className="mt-1 text-xs text-slate-600">
                (1차) 동물 아이콘 레벨 시스템은 다음 단계에서 고정 매핑 적용
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border px-3 py-2">
              <span className="text-lg">🥚</span>
              <span className="text-sm font-extrabold">Lv.1</span>
            </div>
          </div>
        </div>

        {/* Next actions */}
        <div className="mt-6 rounded-2xl border bg-white p-5">
          <div className="text-sm font-extrabold">다음 추천 액션</div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link href="/onboarding" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:bg-slate-50">
              1) 채널평가 온보딩으로 취향 등록하기
            </Link>
            <Link href="/market" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:bg-slate-50">
              2) 마켓 둘러보기
            </Link>
            <Link href="/kyc" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:bg-slate-50">
              3) KYC 진행하기
            </Link>
            <Link href="/wallet" className="rounded-2xl border px-4 py-3 text-sm font-bold hover:bg-slate-50">
              4) 지갑/원장 확인하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-xs font-bold text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-slate-600">{sub}</div>
    </div>
  );
}
