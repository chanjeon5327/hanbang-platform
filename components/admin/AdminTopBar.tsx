'use client';

export default function AdminTopBar() {
  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6">
      <div className="font-bold text-lg">HANBANG Admin</div>
      <div className="text-sm text-gray-500">
        역할: 검수 관리자
      </div>
    </header>
  );
}
