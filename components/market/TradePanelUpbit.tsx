'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useKycStatus } from '@/hooks/useKycStatus';
import { formatKRW } from '@/lib/mock/marketItems';
import { hashSeed, mulberry32 } from '@/lib/mock/series';
import OrderBookMiniUpbit from '@/components/market/OrderBookMiniUpbit';

function UiCard({
  title,
  hint,
  children,
  className = '',
}: {
  title?: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={[
        'rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#121722_0%,#0d1219_100%)] shadow-[0_14px_40px_rgba(0,0,0,0.24)]',
        className,
      ].join(' ')}
    >
      {(title || hint) && (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="text-[15px] font-semibold text-white">{title}</div>
          {hint ? <div className="text-[11px] text-zinc-400">{hint}</div> : null}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

function SegButton({
  active,
  children,
  onClick,
  tone = 'default',
}: {
  active: boolean
  children: React.ReactNode
  onClick?: () => void
  tone?: 'default' | 'buy' | 'sell'
}) {
  const activeClass =
    tone === 'buy'
      ? 'border-emerald-400/30 bg-emerald-400/14 text-emerald-200'
      : tone === 'sell'
        ? 'border-rose-400/30 bg-rose-400/14 text-rose-200'
        : 'border-sky-400/30 bg-sky-400/14 text-sky-200'

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 rounded-2xl border px-4 py-3 text-[14px] font-semibold transition',
        active
          ? activeClass
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function InfoMetric({
  label,
  value,
  valueClassName = 'text-white',
}: {
  label: string
  value: React.ReactNode
  valueClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <div className="text-[11px] text-zinc-400">{label}</div>
      <div className={`mt-1 text-[14px] font-semibold leading-5 ${valueClassName}`}>{value}</div>
    </div>
  )
}

function FieldShell({
  label,
  right,
  children,
}: {
  label: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-[12px] font-medium text-zinc-300">{label}</div>
        {right ? <div className="text-[11px] text-zinc-400">{right}</div> : null}
      </div>
      {children}
    </div>
  )
}

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
  const router = useRouter();
  const { user } = useAuth();
  const { isApproved: isKycVerified } = useKycStatus();

  const [sub, setSub] = useState<Sub>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState<string>(String(basePrice));
  const [qty, setQty] = useState<string>('1');
  const [showKycPrompt, setShowKycPrompt] = useState(false);

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
  const isLoggedIn = Boolean(user);
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
    : '판매·정산은 본인확인 완료 후 진행 가능합니다.';
  const helperText = isBuyTab
    ? '수량과 예상 금액을 확인한 뒤 주문하세요.'
    : '판매 전 수량과 본인확인 상태를 확인하세요.';

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* 좌: 주문 패널 */}
      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#121722_0%,#0d1219_100%)] shadow-[0_14px_40px_rgba(0,0,0,0.24)] p-5">
        <div className="flex gap-2">
          <SegButton active={sub === 'buy'} onClick={() => setSub('buy')} tone="buy">매수</SegButton>
          <SegButton active={sub === 'sell'} onClick={() => setSub('sell')} tone="sell">매도</SegButton>
          <SegButton active={sub === 'edit'} onClick={() => setSub('edit')}>주문수정</SegButton>
          <SegButton active={sub === 'fills'} onClick={() => setSub('fills')}>체결내역</SegButton>
        </div>

        {needKyc && (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-amber-200 text-sm">
            판매/주문수정은 KYC가 필요합니다.{' '}
            <Link href="/kyc" className="underline font-bold">
              KYC 하러가기 →
            </Link>
          </div>
        )}

        {sub === 'fills' ? (
          <div className="mt-5">
            <div className="text-[15px] font-semibold text-white">최근 체결</div>
            <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden bg-white/[0.04]">
              <div className="grid grid-cols-4 text-xs font-semibold text-zinc-400 px-3 py-2 border-b border-white/10">
                <div>시간</div>
                <div className="text-right">가격</div>
                <div className="text-right">수량</div>
                <div className="text-right">구분</div>
              </div>
              {fills.map((r, i) => (
                <div key={i} className="grid grid-cols-4 px-3 py-2 text-sm border-t border-white/10">
                  <div className="tabular-nums text-zinc-300">{r.t}</div>
                  <div className="text-right tabular-nums font-semibold text-white">{formatKRW(r.price)}</div>
                  <div className="text-right tabular-nums text-zinc-300">{r.qty}</div>
                  <div className={`text-right font-semibold ${r.side === '매수' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {r.side}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : sub === 'edit' ? (
          <div className="mt-5">
            <div className="text-[15px] font-semibold text-white">대기 주문</div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
              현재 수정 가능한 주문이 없습니다. (데모)
            </div>
          </div>
        ) : (
          <>
            {/* 지정가/시장가 */}
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-[14px] font-semibold text-white">주문 방식</div>
              <div className="flex gap-2 flex-1 max-w-[240px] ml-auto">
                <SegButton active={orderType === 'limit'} onClick={() => setOrderType('limit')}>지정가</SegButton>
                <SegButton active={orderType === 'market'} onClick={() => setOrderType('market')}>시장가</SegButton>
              </div>
            </div>

            {/* 가용 */}
            <div className="mt-4">
              {sub === 'buy' ? (
                <InfoMetric label="가용 KRW" value={formatKRW(cashKRW)} />
              ) : (
                <InfoMetric label="보유 수량" value={holding} />
              )}
            </div>

            {/* 입력 */}
            <div className="mt-4 space-y-3">
              <FieldShell label="가격" right={orderType === 'market' ? '(시장가)' : undefined}>
                {orderType === 'market' ? (
                  <div className="text-[16px] font-semibold tabular-nums text-white">
                    {formatKRW(basePrice)}
                  </div>
                ) : (
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-[16px] font-semibold tabular-nums text-white bg-transparent outline-none placeholder:text-zinc-500"
                    inputMode="numeric"
                    placeholder="가격"
                  />
                )}
              </FieldShell>

              <FieldShell label="수량" right="* 0.5 단위(데모)">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = Number(qty) || 0;
                      const next = Math.max(0, Number((cur - 0.5).toFixed(3)));
                      setQty(String(next));
                    }}
                    className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] text-lg font-semibold text-white transition"
                    aria-label="수량 감소"
                  >
                    −
                  </button>

                  <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="flex-1 text-[16px] font-semibold tabular-nums text-white bg-transparent outline-none text-center placeholder:text-zinc-500"
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
                    className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.1] text-lg font-semibold text-white transition"
                    aria-label="수량 증가"
                  >
                    +
                  </button>
                </div>
              </FieldShell>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <InfoMetric label="예상 금액" value={formatKRW(Math.round(gross))} />
                <InfoMetric label="수수료(예시)" value={formatKRW(Math.round(fee))} />
                <InfoMetric
                  label={sub === 'buy' ? '총 결제' : '예상 정산'}
                  value={formatKRW(Math.round(total))}
                  valueClassName={sub === 'buy' ? 'text-emerald-200' : 'text-rose-200'}
                />
              </div>
            </div>

            <UiCard
              className="mt-4"
              title={isBuyTab ? '주문 요약' : '판매 요약'}
            >
              <p className="text-[12px] text-zinc-400 mb-3">{helperText}</p>
              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">주문 방식</span>
                  <span className="font-semibold text-white">{isMarketMode ? '시장가' : '지정가'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">수량</span>
                  <span className="font-semibold text-white">{formatPanelNumber(qtyValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">예상 금액</span>
                  <span className="font-semibold text-white">{formatPanelNumber(estimatedTotal)}원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">{isBuyTab ? '사용 가능 잔고' : '보유 가능 수량/잔고'}</span>
                  <span className="font-semibold text-white">{formatPanelNumber(balanceValue)}</span>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-zinc-400">
                {policyText}
              </div>
            </UiCard>

            <button
              type="button"
              onClick={() => {
                if (isBuyTab) {
                  if (!isLoggedIn) {
                    router.push('/login');
                    return;
                  }
                  // 기존 주문 실행 로직 (구매)
                  return;
                }
                if (!isLoggedIn) {
                  router.push('/login');
                  return;
                }
                if (!isKycVerified) {
                  setShowKycPrompt(true);
                  return;
                }
                // 기존 주문 실행 로직 (판매)
              }}
              className={`mt-5 h-14 w-full rounded-2xl text-[15px] font-bold transition shadow-lg ${
                sub === 'buy'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 active:scale-[0.98]'
                  : 'bg-rose-500 text-white hover:bg-rose-400 active:scale-[0.98]'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {primaryButtonLabel}
            </button>

            <p className="mt-3 text-center text-[12px] text-zinc-400">
              {isBuyTab
                ? '구매는 로그인 후 진행 가능합니다.'
                : '판매·정산은 본인확인 완료 후 진행 가능합니다.'}
            </p>

            <div className="mt-4 pb-8 text-xs text-zinc-500">
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

      {showKycPrompt ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 px-4 pb-4 pt-10 md:items-center">
          <div className="w-full max-w-sm overflow-hidden rounded-[24px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <div className="px-5 pb-3 pt-5">
              <div className="text-[16px] font-extrabold text-slate-900">
                판매 등록 전 본인확인이 필요합니다
              </div>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">
                판매와 정산을 진행하려면 본인확인을 먼저 완료해야 합니다.
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-3 text-[12px] text-slate-500">
              구매는 로그인 후 가능하며, 판매·정산은 본인확인 완료 후 진행됩니다.
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 py-4">
              <button
                type="button"
                onClick={() => setShowKycPrompt(false)}
                className="h-11 rounded-2xl bg-slate-100 text-sm font-extrabold text-slate-700"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowKycPrompt(false);
                  router.push('/kyc');
                }}
                className="h-11 rounded-2xl bg-blue-600 text-sm font-extrabold text-white hover:bg-blue-700"
              >
                본인확인 하러 가기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
