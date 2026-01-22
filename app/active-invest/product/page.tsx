"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Star, Share2, Plus, Minus } from "lucide-react";
import Image from "next/image";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useStore } from "@/context/StoreContext";
import MobileProductDetail from "@/components/mobile/MobileProductDetail";
import { getWalletStatus } from "@/lib/wallet/walletStatus";

export default function ProductDetail() {
  const router = useRouter();
  const params = useParams();

  // ✅ Store에서는 순수 비즈니스 로직만 사용
  const { buyStock, sellStock, products } = useStore();

  /* -------------------- 반응형 -------------------- */
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  /* -------------------- 상품 -------------------- */
  const productId = params?.id ? parseInt(params.id as string, 10) : 1;
  const product = products.find((p) => p.id === productId);

  const productName = product?.name ?? "";
  const productPrice = product?.price ?? 10000;
  const currentPrice = productPrice;

  /* -------------------- 주문 상태 -------------------- */
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState(productPrice);
  const [quantity, setQuantity] = useState(1);

  /* -------------------- UI 상태 -------------------- */
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isStarred, setIsStarred] = useState(false);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 3000);
    return () => clearTimeout(t);
  }, [showToast]);

  useEffect(() => {
    if (product) setPrice(product.price);
  }, [product]);

  /* -------------------- 차트 -------------------- */
  const [chartData, setChartData] = useState(() => {
    const base = productPrice;
    const data = Array.from({ length: 30 }, (_, i) => {
      const trend = i * 200;
      const vol = Math.sin(i / 3) * 500;
      return {
        time: `${String(Math.floor(i / 6) + 9).padStart(2, "0")}:${String(
          (i % 6) * 10
        ).padStart(2, "0")}`,
        price: Math.round(base + trend + vol),
      };
    });
    const prices = data.map((d) => d.price);
    const pad = (Math.max(...prices) - Math.min(...prices)) * 0.1;
    return {
      data,
      minPrice: Math.min(...prices) - pad,
      maxPrice: Math.max(...prices) + pad,
    };
  });

  const updateChartData = () => {
    setChartData((prev) => {
      const next = [...prev.data];
      const last = next[next.length - 1]?.price ?? productPrice;
      next.push({
        time: new Date().toTimeString().slice(0, 5),
        price: Math.max(
          productPrice * 0.5,
          Math.round(last + (Math.random() - 0.5) * 1000)
        ),
      });
      const sliced = next.slice(-30);
      const prices = sliced.map((d) => d.price);
      const pad = (Math.max(...prices) - Math.min(...prices)) * 0.1;
      return {
        data: sliced,
        minPrice: Math.min(...prices) - pad,
        maxPrice: Math.max(...prices) + pad,
      };
    });
  };

  /* -------------------- 액션 (A안 핵심) -------------------- */
  const handleBuy = async () => {
    const status = await getWalletStatus();

    if (status !== "AUTH_WALLET") {
      router.push("/login");
      return;
    }

    const orderPrice = orderType === "market" ? currentPrice : price;
    const success = buyStock(
      { name: productName, price: orderPrice },
      quantity
    );

    if (success) {
      setToastMessage(`💰 ${quantity}주 매수 체결!`);
      setShowToast(true);
      updateChartData();
      setTimeout(() => router.push("/wallet"), 1500);
    } else {
      setToastMessage("매수에 실패했습니다.");
      setShowToast(true);
    }
  };

  const handleSell = async () => {
    const status = await getWalletStatus();

    if (status !== "AUTH_WALLET") {
      router.push("/login");
      return;
    }

    const orderPrice = orderType === "market" ? currentPrice : price;
    const success = sellStock(
      { name: productName, price: orderPrice },
      quantity
    );

    if (success) {
      setToastMessage(`💰 ${quantity}주 매도 체결!`);
      setShowToast(true);
      updateChartData();
    } else {
      setToastMessage("매도에 실패했습니다.");
      setShowToast(true);
    }
  };

  /* -------------------- 렌더 분기 -------------------- */
  if (isDesktop === null) return <div className="min-h-screen" />;

  if (!isDesktop) {
    return <MobileProductDetail id={String(productId)} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">상품을 찾을 수 없습니다</h1>
        <Link href="/active-invest">목록으로</Link>
      </div>
    );
  }

  /* -------------------- PC 렌더 -------------------- */
  return (
    <div className="min-h-screen pb-32">
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2">
          {toastMessage}
        </div>
      )}

      {/* ⚠️ UI 영역은 기존 그대로 두고
          매수 버튼 → handleBuy
          매도 버튼 → handleSell
      */}
    </div>
  );
}
