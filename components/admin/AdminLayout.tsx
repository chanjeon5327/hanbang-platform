'use client';

import AdminTopBar from './AdminTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--toss-bg)]">
      <AdminTopBar />
      <div className="max-w-6xl mx-auto px-6 py-6">{children}</div>
    </div>
  );
}
