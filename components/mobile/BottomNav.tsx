'use client';
import React, { useState } from 'react';

export default function BottomNav() {
  const [activeMenu, setActiveMenu] = useState('홈');

  const menus = [
    { id: '홈', icon: '🏠' },
    { id: '랭킹', icon: '🏆' },
    { id: '투자', icon: '📈' },
    { id: '지갑', icon: '💳' },
    { id: '전체', icon: '☰' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[70px] bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe">
      {menus.map((menu) => (
        <button
          key={menu.id}
          onClick={() => setActiveMenu(menu.id)}
          className="flex flex-col items-center justify-center w-full h-full btn-press"
        >
          <span className="text-2xl mb-1">{menu.icon}</span>
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
