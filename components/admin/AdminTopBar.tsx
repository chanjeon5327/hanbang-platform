'use client';

export default function AdminTopBar() {
  return (
    <header className="h-14 bg-white border-b border-[var(--toss-border)] flex items-center justify-between px-6">
      <div className="font-bold body-lg text-[var(--toss-text)]">HANBANG Admin</div>
      <div className="body-sm text-[var(--toss-text-secondary)]">역할: 검수 관리자</div>
    </header>
  );
}
