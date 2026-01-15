"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Wallet, Settings } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "홈", path: "/" },
    { icon: Search, label: "투자", path: "/active-invest" },
    { icon: Wallet, label: "지갑", path: "/wallet" },
    { icon: Settings, label: "설정", path: "/settings" },
  ];

  return (
    <div
      className="bg-white/90 dark:bg-slate-900/90 border-t border-gray-200 dark:border-gray-700"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.08)",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0",
        backdropFilter: "blur(20px)",
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path === "/" && pathname === "/");
        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center gap-1 no-underline transition-all"
            style={{
              color: isActive ? "rgb(37, 99, 235)" : "rgb(156, 163, 175)",
            }}
          >
            <Icon size={24} className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"} />
            <span className={`text-[11px] ${isActive ? "font-bold text-blue-600 dark:text-blue-400" : "font-normal text-gray-400 dark:text-gray-500"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

