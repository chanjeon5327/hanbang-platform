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
    <div className="inline-flex w-full rounded-2xl border border-black/10 bg-white p-1 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`flex-1 px-3 py-3 rounded-xl text-sm font-extrabold transition ${
            value === it.key
              ? 'bg-[#2563EB] text-white'
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
    <div className="inline-flex rounded-xl border border-black/10 bg-white p-1">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={`px-4 py-2 rounded-lg text-sm font-extrabold transition ${
            value === it.key
              ? 'bg-black text-white'
              : 'text-black/60 hover:text-black'
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

function formatPanelNumber(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('ko-KR').format(n);
}

function safeCalc(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
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

  // 가용 자산(샘플)
  const cashKRW = 1250000;
  const holding = 12.345;

  const feeRate = 0.0005; // 0.05% (샘플)
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

  const loading = false;
  const isBuyTab = sub === 'buy';
  const isMarketMode = orderType === 'market';
  const qtyValue = safeCalc(qty);
  const priceValue = orderType === 'market' ? basePrice : safeCalc(price);
  const balanceValue = safeCalc(isBuyTab ? cashKRW : holding);
  const estimatedTotal = qtyValue * priceValue;
  const primaryButtonLabel = loading
    ? '처리 중…'
    : isBuyTab
      ? '매수 주문'
      : '매도 주문';
  const policyText = isBuyTab
    ? '구매는 로그인 후 진행 가능합니다.'
    : '판매·정산은 본인확인이 필요합니다.';
  const helperText = isBuyTab
    ? '수량과 예상 금액을 확인한 뒤 주문하세요.'
    : '판매 전 수량과 본인확인 상태를 확인하세요.';

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* 좌: 주문 패널 */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
        <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-slate-100 p-1">
          {[
            { key: 'buy' as const, label: '매수' },
            { key: 'sell' as const, label: '매도' },
            { key: 'edit' as const, label: '주문수정' },
            { key: 'fills' as const, label: '체결내역' },
          ].map((it) => (
            <button
              key={it.key}
              onClick={() => setSub(it.key)}
              className={`flex-1 h-11 rounded-2xl text-sm font-extrabold transition ${
                sub === it.key
                  ? it.key === 'buy'
                    ? 'bg-blue-600 text-white'
                    : it.key === 'sell'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>

        {needKyc && (
          <div className="mt-4 rounded-xl border border-amber-300/50 bg-amber-100 px-4 py-3 text-amber-900 text-sm">
            판매/주문수정은 KYC가 필요합니다.{' '}
            <Link href="/kyc" className="underline font-bold">
              KYC 하러가기 →
            </Link>
          </div>
        )}

        {sub === 'fills' ? (
          <div className="mt-5">
            <div className="text-sm font-extrabold">최근 체결</div>
            <div className="mt-3 rounded-xl border border-black/10 overflow-hidden">
              <div className="grid grid-cols-4 bg-black/5 text-xs font-bold text-black/60 px-3 py-2">
                <div>시간</div>
                <div className="text-right">가격</div>
                <div className="text-right">수량</div>
                <div className="text-right">구분</div>
              </div>
              {fills.map((r, i) => (
                <div key={i} className="grid grid-cols-4 px-3 py-2 text-sm border-t border-black/10">
                  <div className="tabular-nums text-black/70">{r.t}</div>
                  <div className="text-right tabular-nums font-extrabold">{formatKRW(r.price)}</div>
                  <div className="text-right tabular-nums text-black/70">{r.qty}</div>
                  <div className={`text-right font-extrabold ${r.side === '매수' ? 'text-blue-700' : 'text-red-600'}`}>
                    {r.side}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : sub === 'edit' ? (
          <div className="mt-5">
            <div className="text-sm font-extrabold">대기 주문</div>
            <div className="mt-3 rounded-xl border border-black/10 bg-black/5 p-4 text-sm text-black/70">
              현재 수정 가능한 주문이 없습니다. (데모)
            </div>
          </div>
        ) : (
          <>
            {/* 지정가/시장가 */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold">주문 방식</div>
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                {[
                  { key: 'limit' as const, label: '지정가' },
                  { key: 'market' as const, label: '시장가' },
                ].map((k) => (
                  <button
                    key={k.key}
                    onClick={() => setOrderType(k.key)}
                    className={`h-10 px-4 rounded-xl text-sm font-extrabold transition ${
                      orderType === k.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 가용 */}
            <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-4 text-sm">
              {sub === 'buy' ? (
                <div className="flex items-center justify-between">
                  <span className="text-black/60">가용 KRW</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(cashKRW)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-black/60">보유 수량</span>
                  <span className="font-extrabold tabular-nums">{holding}</span>
                </div>
              )}
            </div>

            {/* 입력 */}
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <div className="text-xs text-black/55">가격</div>
                <div className="mt-2">
                  {orderType === 'market' ? (
                    <div className="text-lg font-extrabold tabular-nums">
                      {formatKRW(basePrice)} <span className="text-sm text-black/50">(시장가)</span>
                    </div>
                  ) : (
                    <input
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-lg font-extrabold tabular-nums outline-none"
                      inputMode="numeric"
                      placeholder="가격"
                    />
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-black/10 bg-white p-4">
                <div className="text-xs text-black/55">수량</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = Number(qty) || 0;
                      const next = Math.max(0, Number((cur - 0.5).toFixed(3)));
                      setQty(String(next));
                    }}
                    className="w-12 h-12 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-lg font-extrabold"
                    aria-label="수량 감소"
                  >
                    −
                  </button>

                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="flex-1 text-lg font-extrabold tabular-nums outline-none text-center"
                    inputMode="decimal"
                    placeholder="수량"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const cur = Number(qty) || 0;
                      const next = Number((cur + 0.5).toFixed(3));
                      setQty(String(next));
                    }}
                    className="w-12 h-12 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 text-lg font-extrabold"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-black/45">* 0.5 단위(데모)</div>
              </div>

              <div className="rounded-xl border border-black/10 bg-black/5 p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-black/60">예상 금액</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(gross))}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-black/60">수수료(예시)</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(fee))}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-black/60">{sub === 'buy' ? '총 결제' : '예상 정산'}</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(total))}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3">
                <div className="text-[13px] font-extrabold text-slate-900">{isBuyTab ? '주문 요약' : '판매 요약'}</div>
                <div className="mt-1 text-[12px] text-slate-500">{helperText}</div>
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">주문 방식</span>
                  <span className="font-bold text-slate-900">{isMarketMode ? '시장가' : '지정가'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">수량</span>
                  <span className="font-bold text-slate-900">{formatPanelNumber(qtyValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">예상 금액</span>
                  <span className="font-bold text-slate-900">{formatPanelNumber(estimatedTotal)}원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">{isBuyTab ? '사용 가능 잔고' : '보유 가능 수량/잔고'}</span>
                  <span className="font-bold text-slate-900">{formatPanelNumber(balanceValue)}</span>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-[12px] text-slate-600">
                {policyText}
              </div>
            </div>

            <button
              className={`mt-4 h-12 w-full rounded-2xl text-sm font-extrabold transition ${
                sub === 'buy'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {primaryButtonLabel}
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              주문 전 가격, 수량, 본인확인 상태를 다시 확인해 주세요.
            </p>

            <div className="mt-3 text-xs text-black/50">
              * 데모 화면입니다. 실제 체결/주문/정산은 엔진 연결 후 활성화됩니다.
            </div>
          </>
        )}
      </div>

      {/* 우: 호가(5/5) */}
      <div className="space-y-5">
        <OrderBookMiniUpbit
          assetId={assetId}
          basePrice={basePrice}
          onPickPrice={(picked) => {
            setOrderType('limit');
            setPrice(String(picked));
          }}
        />

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)]">
          <div className="text-sm font-extrabold">요약</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/10 bg-black/5 p-4">
              <div className="text-xs text-black/55">매수 우위</div>
              <div className="mt-1 font-extrabold tabular-nums text-blue-700">+12%</div>
            </div>
            <div className="rounded-xl border border-black/10 bg-black/5 p-4">
              <div className="text-xs text-black/55">매도 우위</div>
              <div className="mt-1 font-extrabold tabular-nums text-red-600">-8%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
