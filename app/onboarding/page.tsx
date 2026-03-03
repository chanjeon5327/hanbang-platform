'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Channel = {
  id?: string;
  channel_id?: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  tags?: string[];
  category?: string;
};

function pickId(c: Channel, idx: number) {
  return c.id || c.channel_id || `ch_${idx}`;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);         // 1~10
  const [items, setItems] = useState<Channel[]>([]);
  const [picked, setPicked] = useState<Record<string, number>>({}); // id -> score(1~5)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalSteps = 10;

  const progress = useMemo(() => {
    return Math.round((step / totalSteps) * 100);
  }, [step]);

  async function fetchBatch(s: number) {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/onboarding/channels?set=${s}`, { cache: 'no-store' });
      const j = await res.json().catch(() => null);

      // 방어 파싱: 배열 또는 {channels:[]} 또는 {data:[]}
      const arr: unknown[] =
        Array.isArray(j) ? j :
        Array.isArray((j as { channels?: unknown[] })?.channels) ? (j as { channels: unknown[] }).channels :
        Array.isArray((j as { data?: unknown[] })?.data) ? (j as { data: unknown[] }).data :
        [];

      const normalized: Channel[] = arr.map((x: unknown, idx: number) => {
        const o = x as Record<string, unknown>;
        return {
          id: (o?.id ?? o?.channel_id ?? `ch_${idx}`) as string,
          channel_id: o?.channel_id as string | undefined,
          title: (o?.title ?? o?.name) as string | undefined,
          name: (o?.name ?? o?.title) as string | undefined,
          thumbnail: (o?.thumbnail ?? o?.thumbnail_url) as string | undefined,
          thumbnail_url: (o?.thumbnail_url ?? o?.thumbnail) as string | undefined,
          tags: Array.isArray(o?.tags) ? o.tags : [],
          category: o?.category as string | undefined,
        };
      });

      setItems(normalized.slice(0, 50));
    } catch {
      setItems([]);
      setErr('채널 목록을 불러오지 못했습니다. (데모에서는 더미로 진행 가능합니다)');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchBatch(step);
  }, [step]);

  async function rateOne(id: string, score: number) {
    setPicked((prev) => ({ ...prev, [id]: score }));
    // 서버 저장은 "가능하면"만. 실패해도 UX는 진행.
    try {
      await fetch('/api/onboarding/rate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ channel_id: id, score }),
      });
    } catch {
      // ignore
    }
  }

  async function completeOnboarding() {
    setSaving(true);
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ picked }),
      }).catch(() => null);
    } finally {
      setSaving(false);
      router.push('/mypage'); // 완료 후 "내 방"으로
    }
  }

  async function skipOnboarding() {
    setSaving(true);
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ skipped: true }),
      }).catch(() => null);
    } finally {
      setSaving(false);
      router.push('/mypage');
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="mx-auto w-full max-w-[1100px]">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">채널평가 온보딩</h1>
            <p className="mt-1 text-sm text-slate-600">
              무작위 채널을 빠르게 평가하면, 취향을 자동 분류해 추천을 준비합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={skipOnboarding}
              disabled={saving}
              className="rounded-xl border px-3 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              건너뛰기
            </button>
            <Link
              href="/"
              className="rounded-xl border px-3 py-2 text-sm font-bold hover:bg-slate-50"
            >
              홈
            </Link>
          </div>
        </header>

        {/* Progress */}
        <div className="mt-5 rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="font-extrabold">
              {step}/{totalSteps} 세트
            </div>
            <div className="text-slate-600">{progress}%</div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
              채널을 불러오는 중입니다…
            </div>
          ) : (
            <>
              {err ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  {err}
                  <div className="mt-1 text-xs text-amber-800">
                    그래도 더미 UX로 계속 진행 가능합니다.
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {(items.length ? items : dummyChannels()).map((c, idx) => {
                  const id = pickId(c, idx);
                  const title = c.title || c.name || `채널 ${idx + 1}`;
                  const thumb = c.thumbnail_url || c.thumbnail;

                  return (
                    <div key={id} className="rounded-2xl border bg-white p-3">
                      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
                        {thumb ? (
                          <img src={thumb} alt={title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                            thumbnail
                          </div>
                        )}
                      </div>

                      <div className="mt-2 line-clamp-2 text-xs font-extrabold text-slate-900">
                        {title}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => rateOne(id, s)}
                            className={[
                              'h-8 w-8 rounded-lg border text-xs font-extrabold',
                              picked[id] === s ? 'border-blue-600 bg-blue-50 text-blue-700' : 'hover:bg-slate-50',
                            ].join(' ')}
                            aria-label={`rate-${s}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep((v) => Math.max(1, v - 1))}
                  disabled={step === 1 || saving}
                  className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                >
                  이전
                </button>

                {step < totalSteps ? (
                  <button
                    onClick={() => setStep((v) => Math.min(totalSteps, v + 1))}
                    disabled={saving}
                    className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-extrabold text-white disabled:opacity-50"
                  >
                    다음 세트
                  </button>
                ) : (
                  <button
                    onClick={completeOnboarding}
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-extrabold text-white disabled:opacity-50"
                  >
                    {saving ? '완료 처리 중…' : '온보딩 완료'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Re-entry note */}
        <div className="mt-8 rounded-2xl border bg-white p-4 text-sm text-slate-700">
          온보딩을 건너뛰었더라도, 마이페이지(내 방)에서 언제든 <b>&quot;나의 취향 등록&quot;</b>으로 다시 들어올 수 있습니다.
        </div>
      </div>
    </main>
  );
}

function dummyChannels(): Channel[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `dummy_${i}`,
    title: `인기 채널 더미 ${i + 1}`,
    thumbnail_url: '',
    tags: [],
  }));
}
