"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Minus } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getWalletStatus } from "@/lib/wallet/walletStatus";

interface Props {
  id: string;
}

export default function MobileProductDetail({ id }: Props) {
  const router = useRouter();

  const {
    products,
    buyStock,
    sellStock,
  } = useStore();

  const productId = Number(id);
  const product = products.find((p) => p.id === productId);

  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (product) setPrice(product.price);
  }, [product]);

  if (!product) {
    return (
      <div className="p-6 text-center">
        <p className="text-lg font-bold">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const currentPrice = product.price;
  const orderPrice = orderType === "market" ? currentPrice : price;
  const totalAmount = orderPrice * quantity;

  const handleBuy = async () => {
    const status = await getWalletStatus();

    if (status !== "AUTH_WALLET") {
      alert("로그인 및 지갑 연결이 필요합니다.");
      return;
    }

    const success = buyStock(
      { name: product.name, price: orderPrice },
      quantity
    );

    if (success) {
      setToast(`💰 ${quantity}주 매수 완료`);
      setTimeout(() => router.push("/wallet"), 1200);
    } else {
      setToast("매수 실패");
    }
  };

  const handleSell = async () => {
    const status = await getWalletStatus();

    if (status !== "AUTH_WALLET") {
      alert("로그인 및 지갑 연결이 필요합니다.");
      return;
    }

    const success = sellStock(
      { name: product.name, price: orderPrice },
      quantity
    );

    if (success) {
      setToast(`💰 ${quantity}주 매도 완료`);
    } else {
      setToast("매도 실패");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg z-50">
          {toast}
        </div>
      )}

      {/* 이미지 */}
      <div className="relative w-full h-[240px]">
        <Image
          src={
            product.image ??
            "https://images.unsplash.com/photo-1611162617474-5b21e879e113"
          }
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* 정보 */}
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-lg font-bold">
          현재가 {currentPrice.toLocaleString()}원
        </p>

        {/* 주문 방식 */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType("limit")}
            className={`flex-1 py-2 rounded ${
              orderType === "limit"
                ? "bg-purple-600 text-white"
                : "bg-gray-200"
            }`}
          >
            지정가
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={`flex-1 py-2 rounded ${
              orderType === "market"
                ? "bg-purple-600 text-white"
                : "bg-gray-200"
            }`}
          >
            시장가
          </button>
        </div>

        {/* 가격 */}
        {orderType === "limit" && (
          <div className="flex items-center justify-between">
            <span>가격</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPrice((p) => Math.max(0, p - 500))}>
                <Minus />
              </button>
              <span className="font-bold">{price.toLocaleString()}</span>
              <button onClick={() => setPrice((p) => p + 500)}>
                <Plus />
              </button>
            </div>
          </div>
        )}

        {/* 수량 */}
        <div className="flex items-center justify-between">
          <span>수량</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Minus />
            </button>
            <span className="font-bold">{quantity}주</span>
            <button onClick={() => setQuantity((q) => q + 1)}>
              <Plus />
            </button>
          </div>
        </div>

        {/* 합계 */}
        <div className="flex justify-between font-bold">
          <span>총 금액</span>
          <span>{totalAmount.toLocaleString()}원</span>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleBuy}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold"
          >
            매수
          </button>
          <button
            onClick={handleSell}
            className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold"
          >
            매도
          </button>
        </div>
      </div>
    </div>
  );
}
