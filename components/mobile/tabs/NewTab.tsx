"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { Heart } from "lucide-react";

export default function NewTab() {
  const { products } = useStore();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const newProducts = products.slice().reverse().slice(0, 12);

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

  return (
    <div className="p-5">
      <div className="grid grid-cols-2 gap-4">
        {newProducts.map((product) => (
          <Link
            key={product.id}
            href={`/active-invest/product/${product.id}`}
            className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50 active:scale-95 transition-transform cursor-pointer relative"
          >
            <div className="relative h-40">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
              {/* NEW 배지 - 좌측 상단 */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                NEW
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
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-900 dark:text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {product.price.toLocaleString()}원
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
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
          </Link>
        ))}
      </div>
    </div>
  );
}

