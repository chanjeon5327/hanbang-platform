"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getYtThumb } from "@/lib/thumbnails";

/* =====================
   타입 정의
===================== */

interface Holding {
  id: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
}

interface Transaction {
  id: string;
  type: "매수" | "매도";
  name: string;
  price: number;
  qty: number;
  total: number;
  date: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  yield: string;
  price: number;
  image: string;
  description: string;
}

interface StoreContextType {
  userCash: number;
  holdings: Holding[];
  history: Transaction[];
  products: Product[];
  isLoggedIn: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  buyStock: (
    item: { name: string; price: number },
    count: number
  ) => boolean;

  sellStock: (
    item: { name: string; id?: string; price: number },
    count: number
  ) => boolean;

  getTotalAssets: () => number;
  getTotalReturn: () => { amount: number; rate: number };
}

/* =====================
   Context
===================== */

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/* =====================
   상수
===================== */

const STORAGE_KEY = "hanbang_store";

const defaultState = {
  userCash: 10_000_000,
  holdings: [] as Holding[],
  history: [] as Transaction[],
};

/* =====================
   상품 데이터 (SoT)
===================== */

export const products: Product[] = [
  {
    id: 1,
    name: "웹툰 <나 혼자 만렙> 지분",
    category: "웹툰",
    yield: "15.5%",
    price: 10000,
    image: getYtThumb(0),
    description: "글로벌 히트 웹툰 투자",
  },
  {
    id: 2,
    name: "드라마 <한방의 추억> OST",
    category: "드라마",
    yield: "8.2%",
    price: 15000,
    image: getYtThumb(1),
    description: "매달 발생하는 저작권 수익",
  },
];

/* =====================
   Provider
===================== */

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userCash, setUserCash] = useState(defaultState.userCash);
  const [holdings, setHoldings] = useState<Holding[]>(defaultState.holdings);
  const [history, setHistory] = useState<Transaction[]>(defaultState.history);

  /* ---- 초기 로드 (자산 상태만) ---- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setUserCash(parsed.userCash ?? defaultState.userCash);
      setHoldings(parsed.holdings ?? defaultState.holdings);
      setHistory(parsed.history ?? defaultState.history);
    } catch {
      console.warn("Store restore failed, using default state.");
    }
  }, []);

  /* ---- 변경 시 저장 ---- */
  useEffect(() => {
    const data = { userCash, holdings, history };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [userCash, holdings, history]);

  /* =====================
     유틸
  ===================== */

  const formatDateTime = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  /* =====================
     매수 / 매도
  ===================== */

  const buyStock = (
    item: { name: string; price: number },
    count: number
  ): boolean => {
    if (count <= 0) return false;

    const totalCost = item.price * count;
    if (userCash < totalCost) return false;

    setUserCash((prev) => prev - totalCost);

    setHoldings((prev) => {
      const existing = prev.find((h) => h.name === item.name);

      if (!existing) {
        return [
          ...prev,
          {
            id: `${item.name}-${Date.now()}`,
            name: item.name,
            quantity: count,
            avgPrice: item.price,
            currentPrice: item.price,
            currentValue: item.price * count,
          },
        ];
      }

      const newQty = existing.quantity + count;
      const newAvg =
        (existing.avgPrice * existing.quantity + totalCost) / newQty;

      return prev.map((h) =>
        h.name === item.name
          ? {
              ...h,
              quantity: newQty,
              avgPrice: Math.round(newAvg),
              currentPrice: item.price,
              currentValue: item.price * newQty,
            }
          : h
      );
    });

    setHistory((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: "매수",
        name: item.name,
        price: item.price,
        qty: count,
        total: totalCost,
        date: formatDateTime(new Date()),
      },
      ...prev,
    ]);

    return true;
  };

  const sellStock = (
    item: { name: string; id?: string; price: number },
    count: number
  ): boolean => {
    if (count <= 0) return false;

    const holding = holdings.find((h) => h.name === item.name);
    if (!holding || holding.quantity < count) return false;

    const totalAmount = item.price * count;

    setUserCash((prev) => prev + totalAmount);

    setHoldings((prev) =>
      prev
        .map((h) =>
          h.name === item.name
            ? {
                ...h,
                quantity: h.quantity - count,
                currentPrice: item.price,
                currentValue: item.price * (h.quantity - count),
              }
            : h
        )
        .filter((h) => h.quantity > 0)
    );

    setHistory((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: "매도",
        name: item.name,
        price: item.price,
        qty: count,
        total: totalAmount,
        date: formatDateTime(new Date()),
      },
      ...prev,
    ]);

    return true;
  };

  /* =====================
     계산
  ===================== */

  const getTotalAssets = () =>
    userCash + holdings.reduce((sum, h) => sum + h.currentValue, 0);

  const getTotalReturn = () => {
    const cost = holdings.reduce(
      (sum, h) => sum + h.avgPrice * h.quantity,
      0
    );
    const value = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    if (cost === 0) return { amount: 0, rate: 0 };
    return {
      amount: value - cost,
      rate: ((value - cost) / cost) * 100,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        userCash,
        holdings,
        history,
        products,
        isLoggedIn: false,
        openLoginModal: () => router.push("/login"),
        closeLoginModal: () => {},
        buyStock,
        sellStock,
        getTotalAssets,
        getTotalReturn,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

/* =====================
   Hook
===================== */

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
