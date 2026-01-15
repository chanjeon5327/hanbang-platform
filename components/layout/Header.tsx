'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 다크모드 토글 로직
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 h-[50px] bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-gray-100 dark:border-gray-800 transition-colors">
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-1">
        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">H</div>
        <span className="text-xl font-black text-blue-600 tracking-tighter">HANBANG</span>
      </Link>

      {/* 우측 액션 (테마 토글 + 로그인) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300"
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>
        <button className="px-3 py-1.5 text-sm font-bold bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
          로그인
        </button>
      </div>
    </header>
  );
}

