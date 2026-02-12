'use client';

export default function AdminTopBar() {
  return (
    <header className="h-14 bg-white border-b border-[var(--toss-border)] flex items-center justify-between px-6">
      <div className="font-bold text-[18px] text-[var(--toss-text)]">HANBANG Admin</div>
      <div className="text-[14px] text-[var(--toss-text-secondary)]">역할: 검수 관리자</div>
    </header>
  );
}
