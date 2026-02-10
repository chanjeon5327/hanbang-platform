'use client';

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white border-t flex justify-around items-center text-sm">
      <span>🏠</span>
      <span>🔍</span>
      <span className="text-lg">➕</span>
      <span>💬</span>
      <span>👤</span>
    </nav>
  );
}
