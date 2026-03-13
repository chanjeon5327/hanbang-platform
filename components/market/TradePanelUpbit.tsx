'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatKRW } from '@/lib/mock/marketItems';
import { hashSeed, mulberry32 } from '@/lib/mock/series';
import OrderBookMiniUpbit from '@/components/market/OrderBookMiniUpbit';

type Sub = 'buy' | 'sell' | 'edit' | 'fills';
type OrderType = 'limit' | 'market';

function Seg<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string }[];
}) {
  return (
    <div className="inline-flex w-full rounded-xl border border-black/10 bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onChange(it.key)}
          className={`flex-1 px-3 py-2.5 rounded-lg text-[13px] font-extrabold transition ${
            value === it.key
              ? it.key === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-[#2563EB] text-white'
              : 'text-black/60 hover:text-black'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function SmallSeg<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: { key: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-lg border border-black/10 bg-white p-0.5">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onChange(it.key)}
          className={`px-3 py-1.5 rounded-md text-[12px] font-extrabold transition ${
            value === it.key ? 'bg-black text-white' : 'text-black/55 hover:text-black'
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

function num(v: string) {
  const x = Number(String(v).replace(/[^\d.]/g, ''));
  return Number.isFinite(x) ? x : 0;
}

type FillRow = { t: string; side: '매수' | '매도'; price: number; qty: number };

export default function TradePanelUpbit({
  assetId,
  basePrice,
}: {
  assetId: string;
  basePrice: number;
}) {
  const [sub, setSub] = useState<Sub>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState<string>(String(basePrice));
  const [qty, setQty] = useState<string>('1');

  const cashKRW = 1_250_000;
  const holding = 12.345;

  const feeRate = 0.0005;
  const p = orderType === 'market' ? basePrice : num(price);
  const q = num(qty);
  const gross = p * q;
  const fee = gross * feeRate;
  const total = sub === 'buy' ? gross + fee : Math.max(0, gross - fee);

  const fills: FillRow[] = useMemo(() => {
    const rnd = mulberry32(hashSeed(`fills:${assetId}`));
    const rows: FillRow[] = [];
    for (let i = 0; i < 14; i++) {
      const side = rnd() > 0.52 ? '매수' : '매도';
      const delta = (rnd() - 0.5) * 120;
      const pr = Math.max(100, Math.round((basePrice + delta) / 10) * 10);
      const qt = Number((rnd() * 2.2 + 0.08).toFixed(3));
      const hh = String(10 + Math.floor(rnd() * 12)).padStart(2, '0');
      const mm = String(Math.floor(rnd() * 60)).padStart(2, '0');
      const ss = String(Math.floor(rnd() * 60)).padStart(2, '0');
      rows.push({ t: `${hh}:${mm}:${ss}`, side, price: pr, qty: qt });
    }
    return rows;
  }, [assetId, basePrice]);

  const needKyc = sub === 'sell' || sub === 'edit';

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* ── 좌: 주문 패널 ── */}
      <div className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <Seg<Sub>
          value={sub}
          onChange={setSub}
          items={[
            { key: 'buy', label: '구매' },
            { key: 'sell', label: '판매' },
            { key: 'edit', label: '주문수정' },
            { key: 'fills', label: '체결내역' },
          ]}
        />

        {needKyc && (
          <div className="mt-3 rounded-xl border border-amber-300/50 bg-amber-50 px-3 py-2.5 text-amber-900 text-xs leading-5">
            판매·주문수정은 KYC 인증 후 이용 가능합니다.{' '}
            <Link href="/kyc" className="underline font-bold">
              KYC 인증하기 →
            </Link>
          </div>
        )}

        {/* ── 체결내역 탭 ── */}
        {sub === 'fills' ? (
          <div className="mt-4">
            <div className="text-[13px] font-extrabold mb-2">최근 체결</div>
            <div className="rounded-xl border border-black/10 overflow-hidden">
              <div className="grid grid-cols-4 bg-black/[0.04] text-[11px] font-bold text-black/55 px-3 py-2">
                <div>시간</div>
                <div className="text-right">가격</div>
                <div className="text-right">수량</div>
                <div className="text-right">구분</div>
              </div>
              {fills.map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 px-3 py-2 text-[13px] border-t border-black/[0.06] even:bg-black/[0.01]"
                >
                  <div className="tabular-nums text-black/60">{r.t}</div>
                  <div className="text-right tabular-nums font-extrabold">{formatKRW(r.price)}</div>
                  <div className="text-right tabular-nums text-black/65">{r.qty}</div>
                  <div
                    className={`text-right font-extrabold ${
                      r.side === '매수' ? 'text-blue-700' : 'text-red-600'
                    }`}
                  >
                    {r.side}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : sub === 'edit' ? (
          /* ── 주문수정 탭 ── */
          <div className="mt-4">
            <div className="text-[13px] font-extrabold mb-2">대기 주문</div>
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-4 text-[13px] text-black/55 text-center">
              현재 수정 가능한 미체결 주문이 없습니다.
            </div>
          </div>
        ) : (
          /* ── 구매 / 판매 탭 ── */
          <>
            {/* 주문 방식 */}
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-[12px] font-extrabold text-black/60">주문 방식</div>
              <SmallSeg<OrderType>
                value={orderType}
                onChange={setOrderType}
                items={[
                  { key: 'limit', label: '지정가' },
                  { key: 'market', label: '시장가' },
                ]}
              />
            </div>

            {/* 가용 자산 */}
            <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-[13px]">
              {sub === 'buy' ? (
                <div className="flex items-center justify-between">
                  <span className="text-black/55">가용 KRW</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(cashKRW)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-black/55">보유 수량</span>
                  <span className="font-extrabold tabular-nums">{holding}</span>
                </div>
              )}
            </div>

            {/* 입력 영역 */}
            <div className="mt-3 space-y-2">
              {/* 가격 입력 */}
              <div className="rounded-xl border border-black/10 bg-white px-3 py-2.5">
                <div className="text-[10px] font-bold text-black/45 mb-1">가격</div>
                {orderType === 'market' ? (
                  <div className="text-[16px] font-extrabold tabular-nums">
                    {formatKRW(basePrice)}{' '}
                    <span className="text-[11px] font-normal text-black/45">시장가 자동 적용</span>
                  </div>
                ) : (
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-[16px] font-extrabold tabular-nums outline-none bg-transparent"
                    inputMode="numeric"
                    placeholder="가격을 입력하세요"
                  />
                )}
              </div>

              {/* 수량 입력 */}
              <div className="rounded-xl border border-black/10 bg-white px-3 py-2.5">
                <div className="text-[10px] font-bold text-black/45 mb-1">수량</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.max(0, Number((Number(qty || 0) - 0.5).toFixed(3)));
                      setQty(String(next));
                    }}
                    className="w-8 h-8 rounded-lg border border-black/10 bg-black/[0.04] hover:bg-black/10 text-base font-extrabold flex items-center justify-center"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="flex-1 text-[16px] font-extrabold tabular-nums outline-none text-center bg-transparent"
                    inputMode="decimal"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = Number((Number(qty || 0) + 0.5).toFixed(3));
                      setQty(String(next));
                    }}
                    className="w-8 h-8 rounded-lg border border-black/10 bg-black/[0.04] hover:bg-black/10 text-base font-extrabold flex items-center justify-center"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 금액 요약 */}
              <div className="rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-[12px] space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-black/55">예상 금액</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(gross))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/55">수수료 (0.05%)</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(fee))}</span>
                </div>
                <div className="flex items-center justify-between border-t border-black/10 pt-1.5 mt-1">
                  <span className="text-black/70 font-bold">
                    {sub === 'buy' ? '총 결제 금액' : '예상 정산 금액'}
                  </span>
                  <span className="font-extrabold tabular-nums text-[14px]">
                    {formatKRW(Math.round(total))}
                  </span>
                </div>
              </div>
            </div>

            {/* 주문 CTA */}
            <button
              type="button"
              className={`mt-3 w-full py-3 rounded-xl text-[14px] font-extrabold transition active:scale-[0.99] ${
                sub === 'buy'
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_12px_rgba(37,99,235,0.30)]'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_12px_rgba(220,38,38,0.25)]'
              }`}
            >
              {sub === 'buy' ? '구매하기' : '판매하기'}
            </button>
          </>
        )}
      </div>

      {/* ── 우: 호가창 + 시장 요약 ── */}
      <div className="space-y-3">
        <OrderBookMiniUpbit
          assetId={assetId}
          basePrice={basePrice}
          onPickPrice={(picked) => {
            setOrderType('limit');
            setPrice(String(picked));
          }}
        />

        <div className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="text-[12px] font-extrabold text-black/60 mb-3">시장 요약</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2.5">
              <div className="text-[10px] text-black/45 mb-0.5">매수 우위</div>
              <div className="font-extrabold tabular-nums text-[15px] text-blue-700">+12%</div>
            </div>
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2.5">
              <div className="text-[10px] text-black/45 mb-0.5">매도 우위</div>
              <div className="font-extrabold tabular-nums text-[15px] text-red-600">-8%</div>
            </div>
            <div className="rounded-lg border border-black/10 bg-black/[0.03] px-3 py-2.5 col-span-2">
              <div className="text-[10px] text-black/45 mb-0.5">24시간 체결량</div>
              <div className="font-extrabold tabular-nums text-[15px]">
                {formatKRW(Math.round(basePrice * 184.7))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
