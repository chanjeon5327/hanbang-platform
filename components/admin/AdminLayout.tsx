'use client';

import AdminTopBar from './AdminTopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--toss-bg)]">
      <AdminTopBar />
      <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
