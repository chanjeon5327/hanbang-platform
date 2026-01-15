"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { createClient } from "@/lib/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MobileInvestorChat from "@/components/mobile/MobileInvestorChat";

type TabKey = "info" | "order" | "price";

type TradeRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  type: "buy" | "sell" | string;
  amount: number | null;
  quantity: number | null;
  price_at_trade: number | string | null;
  created_at: string; // timestamptz
};

type Candle1m = {
  t: string; // HH:MM
  key: string; // minute key
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// ✅ orderbook_levels 스냅샷 로우(스키마 확정 전이라 select("*") 기반으로 안전 처리)
type OrderbookRowAny = Record<string, any>;

const PRODUCT_UUID_BY_NO: Record<number, string> = {
  1: "02abe3bf-d490-4410-b51b-8f613a32ec76",
  // 2: "....",
  // 3: "....",
};

function formatHHMM(ts: string) {
  try {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "--:--";
  }
}

function minuteKeyLocal(ts: string) {
  try {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return `invalid-${ts}`;
  }
}

function safeNum(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function buildCandles1m(tradesDesc: TradeRow[], fallbackPrice: number): Candle1m[] {
  const tradesAsc = [...tradesDesc].reverse();
  const map = new Map<string, Candle1m>();

  for (const tr of tradesAsc) {
    const price = safeNum(tr.price_at_trade, NaN);
    if (!Number.isFinite(price) || price <= 0) continue;

    const mk = minuteKeyLocal(tr.created_at);
    const label = formatHHMM(tr.created_at);

    const qty = safeNum(tr.quantity, 0);
    const vol = qty > 0 ? qty : 0;

    const existing = map.get(mk);
    if (!existing) {
      map.set(mk, {
        t: label,
        key: mk,
        open: price,
        high: price,
        low: price,
        close: price,
        volume: vol,
      });
    } else {
      existing.high = Math.max(existing.high, price);
      existing.low = Math.min(existing.low, price);
      existing.close = price;
      existing.volume += vol;
    }
  }

  const arr = Array.from(map.values());

  if (arr.length === 0) {
    const p = fallbackPrice > 0 ? fallbackPrice : 10000;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return [
      { t: `${hh}:${mm}`, key: `fallback-${hh}:${mm}`, open: p, high: p, low: p, close: p, volume: 0 },
    ];
  }

  return arr.slice(-60);
}

// ✅ orderbook_levels 로우가 현재 상품을 가리키는지 최대한 유연하게 판별
function matchOrderbookRow(row: OrderbookRowAny, productUuid: string, productNo: number) {
  const pid = row.product_id;
  const pno = row.product_no;

  // product_id가 uuid인 경우
  if (typeof pid === "string" && productUuid && pid === productUuid) return true;

  // product_id가 숫자(또는 문자열 숫자)인 경우 (예: product_id=1)
  if (pid !== undefined && pid !== null) {
    const n = Number(pid);
    if (Number.isFinite(n) && n === productNo) return true;
  }

  // product_no 컬럼이 따로 있는 경우
  if (pno !== undefined && pno !== null) {
    const n = Number(pno);
    if (Number.isFinite(n) && n === productNo) return true;
  }

  return false;
}

// ✅ side 정규화(ask/bid)
function normalizeSide(v: any): "ask" | "bid" | null {
  const s = String(v ?? "").toLowerCase();
  if (s === "ask" || s === "asks" || s === "sell" || s === "seller") return "ask";
  if (s === "bid" || s === "bids" || s === "buy" || s === "buyer") return "bid";
  return null;
}

export default function MobileProductDetail({ id }: { id: string }) {
  const productNo = Number(id || "1");

  const {
    products,
    userCash,
    holdings,
    buyStock,
    sellStock,
    isLoggedIn,
    openLoginModal,
  } = useStore();

  const product = products.find((p) => p.id === productNo);
  const productUuid = PRODUCT_UUID_BY_NO[productNo] || "";

  const [tab, setTab] = useState<TabKey>("info");
  const infoRef = useRef<HTMLDivElement | null>(null);
  const orderRef = useRef<HTMLDivElement | null>(null);
  const priceRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (key: TabKey) => {
    const el =
      key === "info"
        ? infoRef.current
        : key === "order"
        ? orderRef.current
        : priceRef.current;
    if (!el) return;
    setTab(key);
    const top = el.getBoundingClientRect().top + window.scrollY - 118;
    window.scrollTo({ top, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const infoTop = (infoRef.current?.offsetTop ?? 0) - 130;
      const orderTop = (orderRef.current?.offsetTop ?? 0) - 130;
      const priceTop = (priceRef.current?.offsetTop ?? 0) - 130;

      if (y >= priceTop) setTab("price");
      else if (y >= orderTop) setTab("order");
      else if (y >= infoTop) setTab("info");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ trades 실데이터
  const [tradeRows, setTradeRows] = useState<TradeRow[]>([]);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    const load = async () => {
      if (!productUuid) {
        setTradeError("⚠️ PRODUCT_UUID_BY_NO 매핑이 비어있습니다. (productNo → uuid 연결 필요)");
        setTradeRows([]);
        setTradeLoading(false);
        return;
      }

      setTradeLoading(true);
      setTradeError("");

      const { data, error } = await supabase
        .from("trades")
        .select("id, product_id, user_id, type, amount, quantity, price_at_trade, created_at")
        .eq("product_id", productUuid)
        .order("created_at", { ascending: false })
        .limit(200);

      if (!alive) return;

      if (error) {
        setTradeError(`trades 로드 실패: ${error.message}`);
        setTradeRows([]);
      } else {
        setTradeRows((data ?? []) as TradeRow[]);
      }

      setTradeLoading(false);
    };

    load();

    const channel = supabase
      .channel(`trades:${productUuid}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trades",
          filter: `product_id=eq.${productUuid}`,
        },
        (payload) => {
          if (!alive) return;
          const row = payload.new as TradeRow;

          setTradeRows((prev) => {
            const next = [row, ...prev];
            const seen = new Set<string>();
            const uniq = next.filter((x) => {
              if (!x?.id) return true;
              if (seen.has(x.id)) return false;
              seen.add(x.id);
              return true;
            });
            return uniq.slice(0, 200);
          });
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [productUuid]);

  // ✅ 주문 관련
  const productName = product?.name ?? "";
  const productPrice = product?.price ?? 10000;

  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState(productPrice);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setPrice(productPrice), [productPrice, productNo]);

  const holding = holdings.find((h) => h.name === productName);
  const holdingQty = holding?.quantity ?? 0;

  // ✅ 현재가: trades 최신가 우선
  const lastTrade = tradeRows[0];
  const prevTrade = tradeRows[1];

  const currentPrice = useMemo(() => {
    const n = safeNum(lastTrade?.price_at_trade, NaN);
    if (!Number.isFinite(n) || n <= 0) return productPrice;
    return n;
  }, [lastTrade, productPrice]);

  const delta = useMemo(() => {
    const a = safeNum(lastTrade?.price_at_trade, NaN);
    const b = safeNum(prevTrade?.price_at_trade, NaN);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
    return a - b;
  }, [lastTrade, prevTrade]);

  const deltaPct = useMemo(() => {
    const b = safeNum(prevTrade?.price_at_trade, NaN);
    if (!Number.isFinite(b) || b === 0) return 0;
    return (delta / b) * 100;
  }, [delta, prevTrade]);

  const handleBuy = () => {
    if (!isLoggedIn) return openLoginModal();

    const p = orderType === "market" ? currentPrice : price;
    const total = p * quantity;

    if (userCash < total) {
      alert("예수금이 부족합니다.");
      return;
    }

    const ok = buyStock({ name: productName, price: p }, quantity);
    if (ok) alert(`💰 ${quantity}주 매수 체결!`);
    else alert("매수에 실패했습니다.");
  };

  const handleSell = () => {
    if (!isLoggedIn) return openLoginModal();

    if (holdingQty < quantity || holdingQty === 0) {
      alert("보유 수량이 부족합니다.");
      return;
    }

    const p = orderType === "market" ? currentPrice : price;
    const ok = sellStock({ name: productName, price: p }, quantity);

    if (ok) alert(`💰 ${quantity}주 매도 체결!`);
    else alert("매도에 실패했습니다.");
  };

  // ✅ Step2 유지: trades → 1분 캔들(OHLC+거래량)
  const candles1m = useMemo(() => buildCandles1m(tradeRows, productPrice), [tradeRows, productPrice]);

  const chartData = useMemo(() => {
    return candles1m.map((c) => ({
      time: c.t,
      price: c.close,
      volume: c.volume,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
  }, [candles1m]);

  const yDomain = useMemo(() => {
    const prices = candles1m
      .map((c) => [c.open, c.high, c.low, c.close])
      .flat()
      .filter((v) => Number.isFinite(v) && v > 0);

    if (prices.length === 0) {
      const p = productPrice > 0 ? productPrice : 10000;
      return [p * 0.95, p * 1.05] as [number, number];
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = Math.max((max - min) * 0.08, 50);
    return [Math.max(0, min - pad), max + pad] as [number, number];
  }, [candles1m, productPrice]);

  const tradesUI = useMemo(() => {
    return tradeRows.slice(0, 20).map((t) => ({
      id: t.id,
      price: safeNum(t.price_at_trade, 0),
      time: formatHHMM(t.created_at),
      type: String(t.type || ""),
      qty: safeNum(t.quantity, 0),
    }));
  }, [tradeRows]);

  // =========================================================
  // ✅ Step3 핵심: 호가(orderbook_levels) “실데이터 스냅샷 + Realtime 갱신”
  // =========================================================
  const [obRows, setObRows] = useState<OrderbookRowAny[]>([]);
  const [obLoading, setObLoading] = useState(false);
  const [obError, setObError] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    const load = async () => {
      setObLoading(true);
      setObError("");

      // ✅ 스키마 확정 전이라 select("*")로 안전하게 불러온 뒤 JS에서 필터링
      const { data, error } = await supabase
        .from("orderbook_levels")
        .select("*")
        .limit(200);

      if (!alive) return;

      if (error) {
        setObError(`orderbook 로드 실패: ${error.message}`);
        setObRows([]);
      } else {
        const rows = (data ?? []) as OrderbookRowAny[];
        const filtered = rows.filter((r) => matchOrderbookRow(r, productUuid, productNo));
        setObRows(filtered);
      }

      setObLoading(false);
    };

    load();

    // ✅ Realtime: INSERT/UPDATE/DELETE 모두 받고 JS에서 현재 상품만 반영
    const channel = supabase
      .channel(`orderbook_levels:${productUuid || productNo}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orderbook_levels" },
        (payload) => {
          if (!alive) return;

          const evt = payload.eventType;
          const newRow = (payload.new ?? null) as OrderbookRowAny | null;
          const oldRow = (payload.old ?? null) as OrderbookRowAny | null;

          const isMineNew = newRow ? matchOrderbookRow(newRow, productUuid, productNo) : false;
          const isMineOld = oldRow ? matchOrderbookRow(oldRow, productUuid, productNo) : false;

          // 내 상품이 아니면 무시
          if (!isMineNew && !isMineOld) return;

          setObRows((prev) => {
            // 삭제
            if (evt === "DELETE" && oldRow) {
              const oldId = oldRow.id;
              if (oldId === undefined) return prev.filter((x) => x !== oldRow);
              return prev.filter((x) => x?.id !== oldId);
            }

            // 삽입/업데이트
            if (!newRow) return prev;

            const newId = newRow.id;

            // id 없으면(드물지만) 그냥 앞에 넣고 중복 제거
            if (newId === undefined || newId === null) {
              const next = [newRow, ...prev];
              return next.slice(0, 200);
            }

            const idx = prev.findIndex((x) => x?.id === newId);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = newRow;
              return copy;
            }
            return [newRow, ...prev].slice(0, 200);
          });
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [productUuid, productNo]);

  // ✅ UI에 그릴 7레벨(ask/bid) 만들기
  const orderBookUI = useMemo(() => {
    const asks = obRows
      .map((r) => {
        const side = normalizeSide(r.side ?? r.type ?? r.book_side);
        const level = safeNum(r.level ?? r.lv ?? r.lvl, NaN);
        const price = safeNum(r.price ?? r.price_level ?? r.price_at_level, NaN);
        const volume = safeNum(r.volume ?? r.qty ?? r.quantity, 0);
        return { side, level, price, volume };
      })
      .filter((x) => x.side === "ask" && Number.isFinite(x.level) && Number.isFinite(x.price))
      .sort((a, b) => a.level - b.level)
      .slice(0, 7);

    const bids = obRows
      .map((r) => {
        const side = normalizeSide(r.side ?? r.type ?? r.book_side);
        const level = safeNum(r.level ?? r.lv ?? r.lvl, NaN);
        const price = safeNum(r.price ?? r.price_level ?? r.price_at_level, NaN);
        const volume = safeNum(r.volume ?? r.qty ?? r.quantity, 0);
        return { side, level, price, volume };
      })
      .filter((x) => x.side === "bid" && Number.isFinite(x.level) && Number.isFinite(x.price))
      .sort((a, b) => a.level - b.level)
      .slice(0, 7);

    // ✅ 데이터가 비었으면(권한/데이터 부족) fallback 생성(표는 유지되게)
    if (asks.length === 0 || bids.length === 0) {
      const base = currentPrice || productPrice || 10000;
      const step = 100;
      const fbAsks = Array.from({ length: 7 }, (_, i) => ({
        level: i + 1,
        price: base + (i + 1) * step,
        volume: 10 + i * 3,
      }));
      const fbBids = Array.from({ length: 7 }, (_, i) => ({
        level: i + 1,
        price: base - (i + 1) * step,
        volume: 10 + i * 3,
      }));

      return { asks: asks.length ? asks : fbAsks, bids: bids.length ? bids : fbBids, isFallback: true };
    }

    return { asks, bids, isFallback: false };
  }, [obRows, currentPrice, productPrice]);

  if (!product) {
    return (
      <div className="bg-background min-h-screen pt-20 pb-24 px-4">
        <div className="text-xl font-bold mb-2">상품을 찾을 수 없습니다</div>
        <div className="text-sm text-muted-foreground mb-6">요청하신 상품 ID: {productNo}</div>
        <Link href="/active-invest" className="inline-block px-4 py-2 bg-[#7c3aed] text-white rounded-lg font-bold">
          전체 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-16 pb-28">
      {/* 상단 대표 이미지 */}
      <div className="px-4" ref={infoRef}>
        <div className="relative w-full h-[220px] rounded-2xl overflow-hidden bg-black">
          <Image
            src={product.image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1000"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-white text-xl font-extrabold drop-shadow">{product.name}</div>

            {/* 현재가 + 직전대비 */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-white/95 text-sm font-semibold">
                현재가 {currentPrice.toLocaleString()}원
              </span>

              <span
                className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                style={{
                  background: delta >= 0 ? "rgba(239,68,68,0.25)" : "rgba(59,130,246,0.25)",
                  color: "white",
                }}
              >
                {delta >= 0 ? "+" : ""}
                {Math.round(delta).toLocaleString()} ({deltaPct >= 0 ? "+" : ""}
                {deltaPct.toFixed(2)}%)
              </span>

              <span className="ml-auto text-[10px] text-white/90 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="text-white/80 text-xs font-semibold mt-1">
              trades {tradeRows.length}건 {tradeLoading ? "(불러오는 중...)" : ""} {tradeError ? `· ${tradeError}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* 탭 sticky */}
      <div className="sticky top-[56px] z-40 px-4 mt-3">
        <div className="bg-white/90 backdrop-blur border border-gray-200 rounded-full p-1 flex shadow-sm">
          <button
            onClick={() => scrollTo("info")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${tab === "info" ? "bg-[#7c3aed] text-white" : "text-gray-500"}`}
          >
            정보
          </button>
          <button
            onClick={() => scrollTo("order")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${tab === "order" ? "bg-[#7c3aed] text-white" : "text-gray-500"}`}
          >
            주문
          </button>
          <button
            onClick={() => scrollTo("price")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${tab === "price" ? "bg-[#7c3aed] text-white" : "text-gray-500"}`}
          >
            시세
          </button>
        </div>
      </div>

      {/* 정보 섹션 */}
      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-bold mb-3">투자 개요</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">총 투자 모집액</span>
              <span className="font-bold">10억 원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">주당 가격</span>
              <span className="font-bold">{product.price.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">카테고리</span>
              <span className="font-bold">{product.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">예상 수익률</span>
              <span className="font-bold">{product.yield}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-bold mb-3">수익 배분율</div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">창작자</span>
              <span className="font-bold">50%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: "50%" }} />
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-gray-500">투자자</span>
              <span className="font-bold">47%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: "47%" }} />
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-gray-500">수수료</span>
              <span className="font-bold">3%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-gray-400" style={{ width: "3%" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-bold mb-2">투자 계획</div>
          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          <div className="mt-3 text-[11px] text-gray-400 break-all">
            productNo: {productNo} / productUuid: {productUuid || "없음"}
          </div>
        </div>
      </div>

      {/* 주문 섹션 */}
      <div className="px-4 mt-5 space-y-3" ref={orderRef}>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-bold mb-2">주문</div>

          {/* 1분 캔들 기반 차트 */}
          <div className="w-full min-w-0" style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height={240} minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis domain={yDomain as any} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: any, _name: any, ctx: any) => {
                    const p = Number(v);
                    const payload = ctx?.payload;
                    const o = payload?.open;
                    const h = payload?.high;
                    const l = payload?.low;
                    const c = payload?.close;
                    const vol = payload?.volume;
                    return [
                      `종가 ${p.toLocaleString()} / O${Number(o).toLocaleString()} H${Number(h).toLocaleString()} L${Number(l).toLocaleString()} C${Number(c).toLocaleString()} / V${Number(vol).toLocaleString()}`,
                      "1분 캔들",
                    ];
                  }}
                />
                <Area type="monotone" dataKey="price" stroke="#7c3aed" fill="url(#mPrice)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ✅ 호가: 실데이터 스냅샷 */}
          <div className="mt-4 bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-gray-600">
                호가 스냅샷(실데이터)
                {orderBookUI.isFallback ? <span className="ml-2 text-[10px] text-gray-400">(fallback)</span> : null}
              </div>

              <div className="text-[10px] text-gray-400">
                {obLoading ? "불러오는 중..." : obError ? obError : `rows ${obRows.length}건`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* ASK */}
              <div className="space-y-1">
                {orderBookUI.asks.map((a: any, i: number) => (
                  <div key={`ask-${i}`} className="flex justify-between text-xs bg-blue-50 rounded px-2 py-1">
                    <span className="text-blue-600 font-bold">{Number(a.price).toLocaleString()}</span>
                    <span className="text-blue-600">{Number(a.volume).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* BID */}
              <div className="space-y-1">
                {orderBookUI.bids.map((b: any, i: number) => (
                  <div key={`bid-${i}`} className="flex justify-between text-xs bg-red-50 rounded px-2 py-1">
                    <span className="text-red-600 font-bold">{Number(b.price).toLocaleString()}</span>
                    <span className="text-red-600">{Number(b.volume).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-sm font-extrabold mt-2">
              {currentPrice.toLocaleString()} <span className="text-xs text-gray-500">(현재가)</span>
            </div>
          </div>

          {/* 주문폼 */}
          <div className="mt-4">
            <div className="flex gap-2 bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setOrderType("limit")}
                className={`flex-1 py-2 rounded-full text-sm font-bold ${orderType === "limit" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
              >
                지정가
              </button>
              <button
                onClick={() => setOrderType("market")}
                className={`flex-1 py-2 rounded-full text-sm font-bold ${orderType === "market" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
              >
                시장가
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">주문 가격</span>
                {orderType === "market" ? (
                  <span className="text-sm font-extrabold">{currentPrice.toLocaleString()}원</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPrice((p) => Math.max(0, p - 100))} className="w-9 h-9 rounded-full bg-gray-100 font-extrabold">
                      -
                    </button>
                    <div className="w-24 text-center font-extrabold">{price.toLocaleString()}</div>
                    <button onClick={() => setPrice((p) => p + 100)} className="w-9 h-9 rounded-full bg-gray-100 font-extrabold">
                      +
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">주문 수량</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full bg-gray-100 font-extrabold">
                    -
                  </button>
                  <div className="w-20 text-center font-extrabold">{quantity}주</div>
                  <button onClick={() => setQuantity((q) => q + 1)} className="w-9 h-9 rounded-full bg-gray-100 font-extrabold">
                    +
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">총 예상금액</span>
                <span className="text-lg font-extrabold">
                  {((orderType === "market" ? currentPrice : price) * quantity).toLocaleString()}원
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={handleBuy} className="flex-1 py-3 rounded-xl bg-[#ef4444] text-white font-extrabold active:scale-[0.99]">
                  매수하기
                </button>
                <button onClick={handleSell} className="flex-1 py-3 rounded-xl bg-[#3b82f6] text-white font-extrabold active:scale-[0.99]">
                  매도하기
                </button>
              </div>

              <div className="flex gap-2">
                <Link href="/active-invest" className="flex-1 text-center py-3 rounded-xl border border-gray-300 font-bold">
                  목록
                </Link>
                <Link href="/wallet" className="flex-1 text-center py-3 rounded-xl bg-[#7c3aed] text-white font-bold">
                  지갑
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 시세 섹션 */}
      <div className="px-4 mt-5" ref={priceRef}>
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold">시세(체결)</div>
            <div className="text-xs text-gray-500">현재가 {currentPrice.toLocaleString()}원</div>
          </div>

          <div className="divide-y">
            {tradesUI.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                아직 체결 데이터가 없습니다.
              </div>
            ) : (
              tradesUI.map((t) => (
                <div key={t.id} className="py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                      style={{
                        background: t.type === "buy" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                        color: t.type === "buy" ? "#ef4444" : "#3b82f6",
                      }}
                    >
                      {t.type === "buy" ? "매수" : t.type === "sell" ? "매도" : t.type}
                    </span>
                    <span className="font-extrabold">{t.price.toLocaleString()}원</span>
                    <span className="text-xs text-gray-400">{t.qty}주</span>
                  </div>
                  <span className="text-xs text-gray-400">{t.time}</span>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <button className="flex-1 py-3 rounded-xl border border-gray-300 font-bold">목록</button>
            <button className="flex-1 py-3 rounded-xl bg-[#7c3aed] text-white font-bold">지갑</button>
          </div>
        </div>
      </div>

      {/* 모바일 공통: 채팅 */}
    </div>
  );
}
