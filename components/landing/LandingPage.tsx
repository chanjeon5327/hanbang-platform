"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type TickerRow = { symbol: string; name: string; price: string; change: string };
type OrderRow = { price: string; size: string };

export default function LandingPage() {
  const tickers: TickerRow[] = useMemo(
    () => [
      { symbol: "HB-IP1", name: "먹방 채널 A", price: "₩ 12,430", change: "+3.2%" },
      { symbol: "HB-IP2", name: "패션 채널 B", price: "₩ 9,810", change: "-1.1%" },
      { symbol: "HB-IP3", name: "여행 채널 C", price: "₩ 18,220", change: "+0.4%" },
      { symbol: "HB-IP4", name: "테크 채널 D", price: "₩ 7,540", change: "+8.9%" },
    ],
    []
  );

  const asks: OrderRow[] = useMemo(
    () => [
      { price: "₩ 12,520", size: "3.2" },
      { price: "₩ 12,510", size: "1.7" },
      { price: "₩ 12,500", size: "2.1" },
      { price: "₩ 12,490", size: "4.8" },
    ],
    []
  );

  const bids: OrderRow[] = useMemo(
    () => [
      { price: "₩ 12,480", size: "5.1" },
      { price: "₩ 12,470", size: "2.9" },
      { price: "₩ 12,460", size: "1.3" },
      { price: "₩ 12,450", size: "3.6" },
    ],
    []
  );

  const heroVideoSrc: string | null = null;

  const [playExplosion, setPlayExplosion] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setPlayExplosion(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B10] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_30%_20%,rgba(120,90,255,0.25),transparent_60%),radial-gradient(55%_55%_at_80%_30%,rgba(0,220,170,0.20),transparent_60%),radial-gradient(70%_70%_at_50%_80%,rgba(255,120,80,0.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl bg-white/10" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-white/10" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                IP 조각거래 · 정산 불변성 · 실시간 경험
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                콘텐츠가 자산이 되는 곳,
                <span className="block text-white/90">HANBANG</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                “보여주는 것”으로 설득합니다. <br />
                첫 3초: 브랜드. 다음 10초: 금융 신뢰. 그 다음: 거래 UX.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/market"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_18px_40px_rgba(0,0,0,0.35)] hover:opacity-95"
                >
                  시장 둘러보기
                </Link>
                <Link
                  href="/wallet"
                  className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
                >
                  내 지갑 데모
                </Link>

                <div className="ml-1 text-xs text-white/55">
                  ※ 히어로는 “H 폭발” 1~3초(영상/이미지/코드) 중 아무 방식으로 교체 가능
                </div>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <KpiCard title="정산" value="불변성" desc="스냅샷+해시로 고정" />
                <KpiCard title="동시성" value="차단" desc="DB 레벨 락 적용" />
                <KpiCard title="거래" value="미리보기" desc="호가·체결 UX" />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-white/90">브랜드 인트로</div>
                  <div className="text-xs text-white/55">1~3초 연출</div>
                </div>

                <div className="mt-4 relative overflow-hidden rounded-xl border border-white/10 bg-[#0B0C12]">
                  {heroVideoSrc ? (
                    <video
                      className="h-[220px] w-full object-cover"
                      src={heroVideoSrc}
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <div className="relative h-[220px] w-full">
                      <div
                        className={[
                          "absolute inset-0 grid place-items-center",
                          playExplosion ? "h-explode" : "h-settle",
                        ].join(" ")}
                      >
                        <div className="relative">
                          <div className="text-[120px] font-semibold leading-none tracking-tight text-white">
                            H
                          </div>

                          <div className={["ring", playExplosion ? "ring-on" : ""].join(" ")} />
                          <div className={["ring ring2", playExplosion ? "ring-on" : ""].join(" ")} />

                          <div className={["sparks", playExplosion ? "sparks-on" : ""].join(" ")}>
                            {Array.from({ length: 18 }).map((_, i) => (
                              <span key={i} className="spark" style={{ ["--i" as any]: i }} />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.7)_50%,transparent_100%)] animate-scan" />
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-white/90">HB-IP1 · 먹방 채널 A</div>
                    <div className="text-xs text-emerald-300">+3.2%</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <OrderBookSide title="매도" rows={asks} tone="ask" />
                    <OrderBookSide title="매수" rows={bids} tone="bid" />
                  </div>

                  <div className="mt-3 text-xs text-white/55">
                    ※ 실제 데이터 연결 전 “투자자 데모용” 프리뷰입니다.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <Row title="지금 뜨는 채널 (데모)">
              {tickers.map((t) => (
                <Card key={t.symbol} title={t.name} subtitle={t.symbol} price={t.price} change={t.change} />
              ))}
            </Row>

            <Row title="초보도 쉬운 포트폴리오 (데모)">
              {tickers
                .slice()
                .reverse()
                .map((t) => (
                  <Card key={t.symbol + "_2"} title={t.name} subtitle="수익 배당형" price={t.price} change={t.change} />
                ))}
            </Row>
          </div>
        </div>

        <div className="h-14 bg-[linear-gradient(to_bottom,rgba(10,11,16,0),rgba(10,11,16,1))]" />
      </section>

      <section className="bg-white text-black">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">지갑은 “금융앱”처럼 보이게</h2>
          <p className="mt-2 text-sm text-black/60">
            숫자·문장·여백만으로 신뢰를 만듭니다. (카드/표/CTA 중심)
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <LightCard title="내 자산(KRW)" value="₩ 1,250,000" desc="투자자에게 가장 먼저 보여줄 숫자" />
            <LightCard title="예상 정산" value="₩ 42,300" desc="정산 불변성 구조로 ‘설명’이 쉬워짐" />
            <LightCard title="리스크 안내" value="투명 고지" desc="PG/법무 관점 문장 고정" />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/admin/settlements"
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-95"
            >
              관리자 정산 화면
            </Link>
            <Link
              href="/market"
              className="rounded-xl border border-black/15 bg-white px-5 py-3 text-sm font-medium text-black hover:bg-black/5"
            >
              마켓 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .h-explode {
          animation: hPop 1200ms ease-out forwards;
          filter: drop-shadow(0 0 26px rgba(255, 255, 255, 0.22));
        }
        .h-settle {
          filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.16));
        }
        @keyframes hPop {
          0% {
            transform: scale(0.86);
            opacity: 0;
            filter: blur(4px);
          }
          22% {
            transform: scale(1.05);
            opacity: 1;
            filter: blur(0px);
          }
          55% {
            transform: scale(1);
          }
          100% {
            transform: scale(1);
          }
        }

        .ring {
          position: absolute;
          inset: -24px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          opacity: 0;
          transform: scale(0.72);
        }
        .ring2 {
          inset: -42px;
          border-color: rgba(0, 220, 170, 0.16);
        }
        .ring-on {
          animation: ring 1200ms ease-out forwards;
        }
        @keyframes ring {
          0% {
            opacity: 0;
            transform: scale(0.65);
          }
          25% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: scale(1.45);
          }
        }

        .sparks {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
        }
        .sparks-on {
          opacity: 1;
        }
        .spark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          transform-origin: center;
          transform: translate(-50%, -50%);
          animation: spark 900ms ease-out forwards;
          animation-delay: calc(var(--i) * 12ms);
          box-shadow: 0 0 18px rgba(0, 220, 170, 0.18);
        }
        @keyframes spark {
          0% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 18deg)) translateX(0px);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(calc(var(--i) * 18deg)) translateX(110px);
            opacity: 0;
          }
        }

        .animate-scan {
          animation: scan 2200ms ease-in-out infinite;
        }
        @keyframes scan {
          0% {
            transform: translateY(-60%);
          }
          50% {
            transform: translateY(30%);
          }
          100% {
            transform: translateY(120%);
          }
        }
      `}</style>
    </div>
  );
}

function KpiCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      <div className="mt-1 text-xs text-white/55">{desc}</div>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/90">{title}</h3>
        <div className="text-xs text-white/55">가로 스크롤</div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {children}
        <div className="w-4 shrink-0" />
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  price,
  change,
}: {
  title: string;
  subtitle: string;
  price: string;
  change: string;
}) {
  const isUp = change.trim().startsWith("+");
  return (
    <div className="w-[220px] shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
      <div className="text-sm font-medium text-white/90">{title}</div>
      <div className="mt-1 text-xs text-white/55">{subtitle}</div>
      <div className="mt-5 flex items-end justify-between">
        <div className="text-sm font-semibold">{price}</div>
        <div className={`text-xs ${isUp ? "text-emerald-300" : "text-rose-300"}`}>{change}</div>
      </div>
    </div>
  );
}

function OrderBookSide({ title, rows, tone }: { title: string; rows: OrderRow[]; tone: "ask" | "bid" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-xs text-white/60">{title}</div>
      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className={`${tone === "ask" ? "text-rose-300" : "text-emerald-300"}`}>{r.price}</span>
            <span className="text-white/70">{r.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LightCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-xs text-black/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-black/55">{desc}</div>
    </div>
  );
}
