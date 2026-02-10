'use client';

export default function MyAssetSummary() {
  return (
    <section className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="text-sm text-gray-500">나의 총 자산</div>
      <div className="text-3xl font-bold mt-1">₩ 12,340,000</div>
      <div className="text-sm text-green-600 mt-1">
        +2.83% (₩340,000)
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5 text-center text-sm">
        <div>
          <div className="text-gray-500">투자중</div>
          <div className="font-semibold">₩9,000,000</div>
        </div>
        <div>
          <div className="text-gray-500">출금가능</div>
          <div className="font-semibold">₩3,340,000</div>
        </div>
        <div>
          <div className="text-gray-500">수익</div>
          <div className="font-semibold text-green-600">
            +₩340,000
          </div>
        </div>
      </div>
    </section>
  );
}
