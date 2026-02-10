'use client';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="h-14 px-4 flex items-center justify-between border-b">
        <div className="font-bold text-lg">HANBANG</div>
        <div className="flex gap-3 text-sm text-gray-500">
          <span>🔔</span>
          <span>👤</span>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
