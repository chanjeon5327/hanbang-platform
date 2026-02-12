'use client';

export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--toss-bg)] pb-20">
      <header className="h-14 px-4 flex items-center border-b border-[var(--toss-border)] bg-white">
        <h1 className="text-[18px] font-bold text-[var(--toss-text)]">마이페이지</h1>
      </header>
      <main className="px-4 py-6 space-y-6">{children}</main>
    </div>
  );
}
