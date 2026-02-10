'use client';

export default function MyInvestList() {
  return (
    <section>
      <h2 className="font-semibold mb-3">투자 중인 작품</h2>

      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">여행가 제이</div>
              <div className="text-xs text-gray-500 mt-1">
                보유 수량 10주 · 평균가 ₩11,800
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold">₩12,300</div>
              <div className="text-xs text-green-600">
                +3.2%
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
