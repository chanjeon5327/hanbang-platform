"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { Trophy, Medal, Award } from "lucide-react";

export default function RankingTab() {
  const { products } = useStore();
  const sortedByYield = [...products].sort((a, b) => parseFloat(b.yield) - parseFloat(a.yield));

  return (
    <div className="bg-gradient-to-b from-blue-50/50 to-transparent dark:from-slate-900 pb-6">
      {/* 시상대 (Top 3) */}
      <div className="flex items-end justify-center gap-4 mb-8 pt-6">
        {/* 2위 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center mb-2 shadow-lg shadow-gray-200/50 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-xl"></div>
            <Medal size={40} className="text-white relative z-10" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg shadow-gray-200/50 w-24 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">2위</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {sortedByYield[1]?.name || "-"}
            </p>
            <p className="text-lg font-bold text-gray-400 dark:text-gray-500 mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {sortedByYield[1] ? `+${sortedByYield[1].yield}` : "-"}
            </p>
          </div>
        </motion.div>

        {/* 1위 - 왕관 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center mb-2 shadow-xl shadow-gray-200/50 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/50 to-transparent blur-2xl"></div>
            <Trophy size={48} className="text-yellow-800 relative z-10" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg shadow-gray-200/50 w-28 text-center">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1 font-bold">1위</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {sortedByYield[0]?.name || "-"}
            </p>
            <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {sortedByYield[0] ? `+${sortedByYield[0].yield}` : "-"}
            </p>
          </div>
        </motion.div>

        {/* 3위 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mb-2 shadow-lg shadow-gray-200/50 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-transparent blur-xl"></div>
            <Award size={40} className="text-white relative z-10" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg shadow-gray-200/50 w-24 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">3위</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {sortedByYield[2]?.name || "-"}
            </p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
              {sortedByYield[2] ? `+${sortedByYield[2].yield}` : "-"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* 나머지 랭킹 리스트 - 납작한 가로형 바 */}
      <div className="px-5 space-y-2">
        {sortedByYield.slice(3, 15).map((product, idx) => (
          <Link
            key={product.id}
            href={`/active-invest/product/${product.id}`}
            className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
              {idx + 4}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.category}</p>
            </div>
            <p className="text-base font-bold text-red-600 dark:text-red-400 flex-shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
              +{product.yield}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

