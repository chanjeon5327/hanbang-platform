'use client';

export function OrderBookSummary({ onOpen }: { onOpen: () => void }) {
  const sell = [12350, 12340, 12330];
  const buy = [12290, 12280, 12270];

  return (
    <section className="px-4 mt-6">
      <div onClick={onOpen} className="border rounded-xl overflow-hidden">
        {sell.map((p) => (
          <div key={p} className="flex justify-between px-3 py-1 text-sm text-red-600">
            <span>매도</span>
            <span>₩{p.toLocaleString()}</span>
          </div>
        ))}
        <div className="text-center py-2 font-bold bg-gray-100">₩12,300</div>
        {buy.map((p) => (
          <div key={p} className="flex justify-between px-3 py-1 text-sm text-blue-600">
            <span>매수</span>
            <span>₩{p.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-gray-400 mt-2">탭하여 전체 호가 보기</p>
    </section>
  );
}

export function OrderBookPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  const sell = Array.from({ length: 12 }, (_, i) => 12350 - i * 10);
  const buy = Array.from({ length: 12 }, (_, i) => 12290 - i * 10);

  return (
    <div className="fixed inset-0 z-[300] bg-black/40 flex items-end">
      <div className="w-full h-[80vh] bg-white rounded-t-2xl px-4 py-4 overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold text-lg">호가</h2>
          <button onClick={onClose} className="text-sm text-gray-500">닫기</button>
        </div>

        {sell.map((p) => (
          <div key={`s-${p}`} className="flex justify-between py-1 text-red-600">
            <span>매도</span><span>₩{p.toLocaleString()}</span>
          </div>
        ))}

        <div className="text-center py-2 font-bold bg-gray-100 my-2">₩12,300</div>

        {buy.map((p) => (
          <div key={`b-${p}`} className="flex justify-between py-1 text-blue-600">
            <span>매수</span><span>₩{p.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
