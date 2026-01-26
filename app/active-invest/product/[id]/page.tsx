"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/context/StoreContext";

export default function ProductTradePage() {
  const params = useParams();
  const productId = Number(params?.id);

  const {
    products,
    userCash,
    buyStock,
    sellStock,
    holdings,
  } = useStore();

  const product = products.find((p) => p.id === productId);

  const [count, setCount] = useState(1);

  if (!product) {
    return <div className="p-6">상품을 찾을 수 없습니다.</div>;
  }

  const myHolding = holdings.find((h) => h.name === product.name);

  const handleBuy = () => {
    const ok = buyStock(
      { name: product.name, price: product.price },
      count
    );

    if (!ok) {
      alert("잔액이 부족하거나 수량이 올바르지 않습니다.");
    }
  };

  const handleSell = () => {
    if (!myHolding) {
      alert("보유 수량이 없습니다.");
      return;
    }

    const ok = sellStock(
      { name: product.name, price: product.price },
      count
    );

    if (!ok) {
      alert("매도 수량이 올바르지 않습니다.");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold">{product.name}</h1>

      <div className="text-gray-600">{product.description}</div>

      <div className="border rounded-xl p-4 space-y-2">
        <div>가격: {product.price.toLocaleString()}원</div>
        <div>내 보유 현금: {userCash.toLocaleString()}원</div>
        <div>
          보유 수량: {myHolding ? myHolding.quantity : 0}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 w-24"
        />
        <span>수량</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleBuy}
          className="flex-1 bg-black text-white py-3 rounded-lg font-bold"
        >
          매수
        </button>

        <button
          onClick={handleSell}
          className="flex-1 border py-3 rounded-lg font-bold"
        >
          매도
        </button>
      </div>
    </div>
  );
}
