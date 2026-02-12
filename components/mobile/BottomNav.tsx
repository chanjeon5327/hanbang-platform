'use client';
import React, { useState } from 'react';
import { Home, Trophy, TrendingUp, Wallet, LayoutGrid } from 'lucide-react';

export default function BottomNav() {
  const [activeMenu, setActiveMenu] = useState('홈');

  const menus = [
    { id: '홈', Icon: Home },
    { id: '랭킹', Icon: Trophy },
    { id: '투자', Icon: TrendingUp },
    { id: '지갑', Icon: Wallet },
    { id: '전체', Icon: LayoutGrid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe">
      {menus.map((menu) => (
        <button
          key={menu.id}
          onClick={() => setActiveMenu(menu.id)}
          className="flex flex-col items-center justify-center w-full h-full btn-press"
        >
          <menu.Icon size={26} strokeWidth={2} className="mb-1" />
          <span
            className={`text-[10px] font-medium ${
              activeMenu === menu.id ? 'text-black' : 'text-gray-300'
            }`}
          >
            {menu.id}
          </span>
        </button>
      ))}
    </nav>
  );
}
