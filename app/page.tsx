import MainContentList from '@/components/content/MainContentList';

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">

      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b1d33] via-[#0a3d62] to-white" />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* 좌측 텍스트 */}
          <div className="relative z-10 text-center md:text-left -mt-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              유튜브 채널 사고파는 마켓
            </h1>

            <p className="mt-3 text-lg text-blue-100">
              콘텐츠가 자산이 되는 곳
            </p>

            {/* 브랜드 위스퍼 */}
            <p className="mt-4 text-sm text-white/60 italic">
              우리가 돈이 없지, 유머가 없냐.
            </p>

            <div className="mt-6 flex justify-center md:justify-start gap-4">
              <button className="px-7 py-3 bg-white text-black font-semibold rounded-xl">
                데모 보기
              </button>
              <button className="px-7 py-3 border border-white/70 text-white rounded-xl">
                개념 알아보기
              </button>
            </div>
          </div>

          {/* 우측 비주얼 : 손 → 손 전달 */}
          <div className="relative h-[360px] flex items-center justify-center -mt-8">

            {/* 왼손 */}
            <div className="absolute left-[20px] top-[20px] rotate-[-8deg]">
              <img
                src="/L-final.png"
                alt="give youtube hand"
                className="w-56"
              />
              <div className="mx-auto mt-1 w-24 h-[2px] bg-white/70 rounded-full" />
            </div>

            {/* 오른손 */}
            <div className="absolute right-[40px] bottom-[60px] rotate-[8deg]">
              <img
                src="/R-final.png"
                alt="receive hand"
                className="w-56"
              />
              <div className="mx-auto mt-1 w-24 h-[2px] bg-white/70 rounded-full" />
            </div>

          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* 지금 열려있는 콘텐츠 (메인 전용) */}
      {/* ============================= */}
      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            지금 열려있는 콘텐츠
          </h2>

          <MainContentList />

          <div className="mt-10 text-center">
            <button className="rounded-full border px-6 py-2 text-sm text-gray-700">
              더 많은 콘텐츠 보기
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
