"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getYtThumb } from "@/lib/thumbnails";

/* =====================
   ?占�???類ㅼ벥
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
  type: "筌띲끉�땾" | "筌띲끇猷�";
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
   ?怨몃땾
===================== */

const STORAGE_KEY = "hanbang_store";

const defaultState = {
  userCash: 10_000_000,
  holdings: [] as Holding[],
  history: [] as Transaction[],
};

/* =====================
   ?怨밸�� ?怨쀬뵠??(SoT)
===================== */

export const products: Product[] = [
  {
    id: 1,
    name: "�뒪�룷痢� <�삱由쇳뵿 �쑀��� �씠踰ㅽ듃> �떆利�",
    category: "�뒪�룷痢�",
    yield: "15.5%",
    price: 10000,
    image: getYtThumb(0),
    description: "�쑀紐� �뒪��� �뒪�룷痢� �떆利�",
  },
  {
    id: 2,
    name: "�쎒�냼�꽕 <罹먮끉 �뵒�뒪�꽣�뵾�븘> OST",
    category: "�쎒�냼�꽕",
    yield: "8.2%",
    price: 15000,
    image: getYtThumb(1),
    description: "�씤湲� 踰좎뒪�듃����윭 �쎒�냼�꽕 �떆利�",
  },
];

/* =====================
   Provider
===================== */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [userCash, setUserCash] = useState(defaultState.userCash);
  const [holdings, setHoldings] = useState<Holding[]>(defaultState.holdings);
  const [history, setHistory] = useState<Transaction[]>(defaultState.history);

  /* ---- �룯�뜃由� 嚥≪뮆諭� (?癒�沅� ?怨밴묶筌�? ---- */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setUserCash(parsed.userCash ?? defaultState.userCash);
      setHoldings(parsed.holdings ?? defaultState.holdings);
      setHistory(parsed.history ?? defaultState.history);
    } catch {
    }
  }, []);

  /* ---- 癰귨옙野�????占�??---- */
  useEffect(() => {
    const data = { userCash, holdings, history };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [userCash, holdings, history]);

  /* =====================
     ?醫뤿뼢
  ===================== */

  const formatDateTime = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  /* =====================
     筌띲끉�땾 / 筌띲끇猷�
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
        type: "筌띲끉�땾",
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
        type: "筌띲끇猷�",
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
     ��④쑴沅�
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
