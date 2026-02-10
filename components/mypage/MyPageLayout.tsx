'use client';

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="h-14 px-4 flex items-center border-b bg-white">
        <h1 className="font-bold text-lg">마이페이지</h1>
      </header>

      <main className="px-4 py-6 space-y-8">
        {children}
      </main>
    </div>
  );
}
