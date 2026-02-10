'use client';

export default function MyAssetHero() {
  return (
    <section className="px-4 py-6">
      <div className="text-sm text-gray-500">총 자산</div>
      <div className="text-3xl font-bold mt-1">₩ 12,340,000</div>
      <div className="text-sm text-green-600 mt-1">
        +₩340,000 (+2.83%)
      </div>

      <div className="flex gap-2 mt-4">
        <button className="flex-1 py-2 rounded-xl bg-gray-100 text-sm">
          투자중
        </button>
        <button className="flex-1 py-2 rounded-xl bg-gray-100 text-sm">
          출금가능
        </button>
      </div>
    </section>
  );
}
