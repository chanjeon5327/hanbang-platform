'use client';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--toss-bg)] pb-20" data-testid="mypage">
      <header className="h-14 px-4 flex items-center border-b border-[var(--toss-border)] bg-white">
        <h1 className="body-lg font-bold text-[var(--toss-text)]">마이페이지</h1>
      </header>
      <div className="py-6 space-y-6">{children}</div>
    </div>
  );
}
