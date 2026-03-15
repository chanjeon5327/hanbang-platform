'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { formatKRW } from '@/lib/mock/marketItems';
import { useToast } from '@/context/ToastContext';
import { getBrowserSupabase } from '@/utils/supabase/client';
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
    <div className="inline-flex w-full rounded-xl border border-black/10 bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onChange(it.key)}
          className={`flex-1 px-2 py-2.5 rounded-lg text-[13px] font-extrabold transition ${
            value === it.key
              ? it.key === 'sell'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#2563EB] text-white shadow-sm'
              : 'text-black/55 hover:text-black'
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
    <div className="inline-flex rounded-lg border border-black/10 bg-black/[0.03] p-0.5">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onChange(it.key)}
          className={`px-3 py-1.5 rounded-md text-[12px] font-extrabold transition ${
            value === it.key ? 'bg-white text-black shadow-sm' : 'text-black/50 hover:text-black'
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
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { toast } = useToast();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [sub, setSub] = useState<Sub>('buy');

  useEffect(() => {
    let alive = true;
    getBrowserSupabase()
      .auth.getSession()
      .then((res: { data: { session?: { user?: unknown } } }) => {
        if (alive) setHasSession(!!res.data.session?.user);
      })
      .catch(() => {
        if (alive) setHasSession(false);
      });
    return () => {
      alive = false;
    };
  }, []);
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
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
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
          <div className="mt-3 rounded-xl border border-amber-300/50 bg-amber-50 px-3.5 py-2.5 text-amber-900 text-xs leading-5">
            판매·주문수정은 인증 후 이용 가능해요.{' '}
            <Link href="/kyc" className="underline font-bold">
              인증하기 →
            </Link>
          </div>
        )}

        {/* ── 체결내역 탭 ── */}
        {sub === 'fills' ? (
          <div className="mt-4">
            <div className="text-[13px] font-extrabold mb-2">최근 체결</div>
            <div className="rounded-xl border border-black/[0.08] overflow-hidden">
              <div className="grid grid-cols-4 bg-black/[0.03] text-[11px] font-bold text-black/50 px-3 py-2">
                <div>시간</div>
                <div className="text-right">가격</div>
                <div className="text-right">수량</div>
                <div className="text-right">구분</div>
              </div>
              {fills.map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 px-3 py-2 text-[12px] border-t border-black/[0.05] even:bg-black/[0.01]"
                >
                  <div className="tabular-nums text-black/50">{r.t}</div>
                  <div className="text-right tabular-nums font-extrabold">{formatKRW(r.price)}</div>
                  <div className="text-right tabular-nums text-black/60">{r.qty}</div>
                  <div
                    className={`text-right font-extrabold text-[11px] ${
                      r.side === '매수' ? 'text-blue-600' : 'text-red-600'
                    }`}
                  >
                    {r.side}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : sub === 'edit' ? (
          <div className="mt-4">
            <div className="text-[13px] font-extrabold mb-2">대기 주문</div>
            <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] p-4 text-[13px] text-black/45 text-center">
              현재 수정 가능한 미체결 주문이 없습니다.
            </div>
          </div>
        ) : (
          <>
            {/* 주문 방식 */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[12px] font-bold text-black/50">주문 방식</div>
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
            <div className="mt-3 rounded-xl border border-black/[0.08] bg-black/[0.025] px-3.5 py-2.5">
              {sub === 'buy' ? (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-black/50">가용 KRW</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(cashKRW)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-black/50">보유 수량</span>
                  <span className="font-extrabold tabular-nums">{holding}</span>
                </div>
              )}
            </div>

            {/* 가격 + 수량 입력 */}
            <div className="mt-3 space-y-2">
              {/* 가격 */}
              <div className="rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 focus-within:border-[#2563EB]/40 focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition">
                <div className="text-[10px] font-bold text-black/40 mb-1 uppercase tracking-wide">가격</div>
                {orderType === 'market' ? (
                  <div className="text-[16px] font-extrabold tabular-nums text-black/90">
                    {formatKRW(basePrice)}{' '}
                    <span className="text-[11px] font-medium text-black/40">시장가 자동</span>
                  </div>
                ) : (
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-[16px] font-extrabold tabular-nums outline-none bg-transparent text-black/90"
                    inputMode="numeric"
                    placeholder={String(basePrice)}
                  />
                )}
              </div>

              {/* 수량 */}
              <div className="rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 focus-within:border-[#2563EB]/40 focus-within:ring-2 focus-within:ring-[#2563EB]/10 transition">
                <div className="text-[10px] font-bold text-black/40 mb-1 uppercase tracking-wide">수량</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty(String(Math.max(0, Number((Number(qty || 0) - 0.5).toFixed(3)))))}
                    className="w-7 h-7 rounded-lg border border-black/10 bg-black/[0.03] hover:bg-black/[0.07] text-base font-extrabold flex items-center justify-center transition"
                    aria-label="수량 감소"
                  >
                    −
                  </button>
                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="flex-1 text-[16px] font-extrabold tabular-nums outline-none text-center bg-transparent text-black/90"
                    inputMode="decimal"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(String(Number((Number(qty || 0) + 0.5).toFixed(3))))}
                    className="w-7 h-7 rounded-lg border border-black/10 bg-black/[0.03] hover:bg-black/[0.07] text-base font-extrabold flex items-center justify-center transition"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 금액 요약 */}
              <div className="rounded-xl border border-black/[0.08] bg-black/[0.025] px-3.5 py-2.5 text-[12px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-black/50">예상 금액</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(gross))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black/50">수수료 (0.05%)</span>
                  <span className="font-extrabold tabular-nums">{formatKRW(Math.round(fee))}</span>
                </div>
                <div className="flex items-center justify-between border-t border-black/[0.06] pt-1.5 mt-1">
                  <span className="text-black/70 font-bold text-[13px]">
                    {sub === 'buy' ? '총 결제 금액' : '예상 정산'}
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
              onClick={() => {
                if (hasSession === false) {
                  window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
                  return;
                }
                if (needKyc) {
                  toast('KYC 완료 후 이용할 수 있어요.');
                  router.push('/kyc');
                  return;
                }
                toast('거래 기능 준비 중입니다.');
              }}
              className={`mt-4 w-full py-3.5 rounded-xl text-[14px] font-extrabold transition active:scale-[0.98] ${
                sub === 'buy'
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_6px_16px_rgba(37,99,235,0.38)]'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_6px_16px_rgba(220,38,38,0.32)]'
              }`}
            >
              {hasSession === false ? '로그인 후 거래하기' : sub === 'buy' ? '구매하기' : '판매하기'}
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

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-extrabold text-black/65">시장 요약</div>
            <span className="text-[10px] text-black/40 tabular-nums">실시간</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-3 py-2.5">
              <div className="text-[10px] text-black/40 uppercase tracking-wide mb-1">매수 우위</div>
              <div className="font-extrabold tabular-nums text-[15px] text-blue-600">+12%</div>
              <div className="text-[10px] text-black/35 mt-0.5">매수 / (매수+매도)</div>
            </div>
            <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-3 py-2.5">
              <div className="text-[10px] text-black/40 uppercase tracking-wide mb-1">매도 우위</div>
              <div className="font-extrabold tabular-nums text-[15px] text-red-600">−8%</div>
              <div className="text-[10px] text-black/35 mt-0.5">매도 / (매수+매도)</div>
            </div>
            <div className="rounded-xl border border-black/[0.08] bg-black/[0.02] px-3 py-2.5 col-span-2">
              <div className="text-[10px] text-black/40 uppercase tracking-wide mb-1">24h 체결량</div>
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
