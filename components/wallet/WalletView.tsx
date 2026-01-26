"use client";

import { useStore } from "@/context/StoreContext";

export default function WalletView() {
  const {
    userCash,
    holdings,
    history,
    getTotalAssets,
    getTotalReturn,
  } = useStore();

  const totalAssets = getTotalAssets();
  const { amount, rate } = getTotalReturn();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* 📊 자산 요약 */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-lg font-bold mb-2">내 자산 요약</h2>

        <div className="text-3xl font-extrabold mb-1">
          {totalAssets.toLocaleString()}원
        </div>

        <div className="text-sm text-gray-500 mb-4">
          보유 현금 {userCash.toLocaleString()}원
        </div>

        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            amount >= 0
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          총 손익 {amount >= 0 ? "+" : ""}
          {amount.toLocaleString()}원 (
          {rate >= 0 ? "+" : ""}
          {rate.toFixed(2)}%)
        </div>
      </section>

      {/* 📦 보유 자산 */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-lg font-bold mb-4">보유 자산</h2>

        {holdings.length === 0 ? (
          <div className="text-gray-500">
            보유 중인 자산이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((h) => (
              <div
                key={h.id}
                className="flex justify-between items-center border rounded-lg p-4"
              >
                <div>
                  <div className="font-bold">{h.name}</div>
                  <div className="text-sm text-gray-500">
                    {h.quantity}주 · 평균가 {h.avgPrice.toLocaleString()}원
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">
                    {h.currentValue.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500">
                    현재가 {h.currentPrice.toLocaleString()}원
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🧾 거래 내역 */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border">
        <h2 className="text-lg font-bold mb-4">거래 내역</h2>

        {history.length === 0 ? (
          <div className="text-gray-500">
            아직 거래 내역이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((tx) => (
              <div
                key={tx.id}
                className="flex justify-between items-center border rounded-lg p-4"
              >
                <div>
                  <div className="font-bold">
                    {tx.type} · {tx.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {tx.date}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">
                    {tx.total.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-500">
                    {tx.qty}주 · {tx.price.toLocaleString()}원
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
