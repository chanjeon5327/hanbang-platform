"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { ArrowRight, Heart } from "lucide-react";

export default function HomeTab() {
  const { products } = useStore();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // 섹션별로 상품 분류
  const sections = [
    { title: "인기 투자 상품", products: products.slice(0, 10) },
    { title: "추천 콘텐츠", products: products.slice(5, 15) },
    { title: "최신 상품", products: products.slice(10, 20) },
  ];

  return (
    <div className="space-y-8 pb-6">
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="space-y-4">
          <div className="px-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h3>
            <Link href="/active-invest" className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              전체보기
            </Link>
          </div>
          
          {/* 가로 스크롤 레일 - 넷플릭스 스타일 */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-5" style={{ WebkitOverflowScrolling: "touch" }}>
            {section.products.map((product) => (
              <Link
                key={product.id}
                href={`/active-invest/product/${product.id}`}
                className="w-[160px] flex-shrink-0 snap-start no-underline text-inherit active:scale-95 transition-transform cursor-pointer"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg shadow-gray-200/50 relative">
                  {/* 세로형 포스터 카드 */}
                  <div className="relative h-[240px]">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-bold text-white">
                      {product.category}
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md active:scale-95 transition-transform cursor-pointer"
                    >
                      <Heart
                        size={16}
                        className={favorites.has(product.id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                      />
                    </button>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-bold text-slate-900 dark:text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                        {product.price.toLocaleString()}원
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded w-fit ${
                          parseFloat(product.yield) > 0
                            ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                            : "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        }`}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {parseFloat(product.yield) > 0 ? "+" : ""}
                        {product.yield}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {/* "더 보기" 힌트 - 카드가 살짝 걸쳐 보이도록 */}
            <div className="w-[160px] flex-shrink-0 flex items-center justify-center">
              <div className="text-center">
                <ArrowRight size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">더 보기</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

