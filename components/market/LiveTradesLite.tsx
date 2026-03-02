'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatKRW } from '@/lib/mock/marketItems';
import { mulberry32, hashSeed } from '@/lib/mock/series';

type Side = 'buy' | 'sell';

type Trade = {
  id: string;
  ts: Date;
  price: number;
  qty: number;
  side: Side;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function fmtTime(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export default function LiveTradesLite({
  symbolId,
  basePrice,
}: {
  symbolId: string;
  basePrice: number;
}) {
  const rnd = useMemo(() => mulberry32(hashSeed(`trades:${symbolId}`)), [symbolId]);
  const [rows, setRows] = useState<Trade[]>([]);
  const tickRef = useRef(0);

  const genTrade = () => {
    const t = new Date();
    const side: Side = rnd() > 0.52 ? 'buy' : 'sell';
    const delta = (rnd() - 0.5) * (rnd() > 0.92 ? 90 : 30);
    const price = Math.max(100, Math.round((basePrice + delta) / 10) * 10);
    const qty = Number((rnd() * 2.5 + 0.05).toFixed(3));
    tickRef.current += 1;
    return {
      id: `${t.getTime()}-${tickRef.current}`,
      ts: t,
      price,
      qty,
      side,
    };
  };

  useEffect(() => {
    // 초기 14개
    const init: Trade[] = [];
    for (let i = 0; i < 14; i++) init.push(genTrade());
    init.reverse(); // 최신이 위로
    setRows(init);

    const iv = setInterval(() => {
      const next = genTrade();
      setRows((prev) => [next, ...prev].slice(0, 22));
    }, 1700);

    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolId]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm font-extrabold">실시간 체결</div>
          <div className="text-xs text-black/50 mt-1">시간 · 가격 · 수량</div>
        </div>
        <div className="text-xs text-black/45">LIVE</div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-black/10">
        <div className="grid grid-cols-4 bg-black/5 text-xs font-bold text-black/60 px-3 py-2">
          <div>시간</div>
          <div className="text-right">가격</div>
          <div className="text-right">수량</div>
          <div className="text-right">구분</div>
        </div>

        <div className="max-h-[340px] overflow-auto">
          {rows.map((r, idx) => {
            const isNew = idx === 0;
            const sideText = r.side === 'buy' ? '매수' : '매도';
            const sideColor = r.side === 'buy' ? 'text-blue-600' : 'text-red-500';
            return (
              <div
                key={r.id}
                className={`grid grid-cols-4 px-3 py-2 text-sm border-t border-black/10 ${
                  isNew ? 'bg-amber-100/50' : 'bg-white'
                }`}
              >
                <div className="tabular-nums text-black/70">{fmtTime(r.ts)}</div>
                <div className="text-right tabular-nums font-extrabold">{formatKRW(r.price)}</div>
                <div className="text-right tabular-nums text-black/70">{r.qty}</div>
                <div className={`text-right font-extrabold ${sideColor}`}>{sideText}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
