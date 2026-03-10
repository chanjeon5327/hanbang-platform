'use client';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--toss-bg)] pb-20" data-testid="mypage">
      <header className="h-12 px-4 flex items-center border-b border-[var(--toss-border)] bg-white">
        <h1 className="text-[16px] font-bold text-[var(--toss-text)]">마이페이지</h1>
      </header>
      <div className="py-4 space-y-4">{children}</div>
    </div>
  );
}
