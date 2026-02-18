'use client';

import { useState, useCallback, useEffect } from 'react';
import { Shield, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { HBCard } from '@/components/ui/HBCard';
import HBTabs from '@/components/ui/HBTabs';
import HBSkeleton from '@/components/ui/HBSkeleton';
import { HBEmpty, HBError } from '@/components/ui/HBSkeleton';

/* ── 타입 ──────────────────────────────────────────── */
interface AuditLog {
  id: string;
  user_id: string | null;
  email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  event_type: string | null;
  failure_reason: string | null;
  created_at: string;
}

interface FetchResult {
  ok: boolean;
  total: number;
  page: number;
  limit: number;
  items: AuditLog[];
  error?: string;
}

/* ── 기간 탭 ────────────────────────────────────────── */
const PERIOD_TABS = [
  { key: '1',  label: '최근 24h' },
  { key: '7',  label: '7일' },
  { key: '30', label: '30일' },
];

/* ── 성공/실패 탭 ────────────────────────────────────── */
const SUCCESS_TABS = [
  { key: 'all',   label: '전체' },
  { key: 'true',  label: '성공' },
  { key: 'false', label: '실패' },
];

const PAGE_SIZE = 200;

/* ── 메인 컴포넌트 ──────────────────────────────────── */
export default function AuditLoginsPage() {
  const [period,    setPeriod]    = useState('7');
  const [success,   setSuccess]   = useState('all');
  const [emailQ,    setEmailQ]    = useState('');
  const [page,      setPage]      = useState(1);
  const [result,    setResult]    = useState<FetchResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [fetchErr,  setFetchErr]  = useState<string | null>(null);

  const fetchLogs = useCallback(async (p: number = page) => {
    setLoading(true);
    setFetchErr(null);
    try {
      const params = new URLSearchParams({
        period,
        page: String(p),
        limit: String(PAGE_SIZE),
      });
      if (success !== 'all') params.set('success', success);
      if (emailQ.trim())     params.set('email',   emailQ.trim());

      const res = await fetch(`/api/admin/audit-logins?${params}`, { cache: 'no-store' });
      const json: FetchResult = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      setResult(json);
      setPage(p);
    } catch (e) {
      setFetchErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [period, success, emailQ, page]);

  // 필터 변경 시 1페이지로 리셋
  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, success]);

  const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

  return (
    <div className="max-w-6xl space-y-6">
      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3">
        <Shield size={24} style={{ color: 'var(--royal-blue)' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            로그인 감사 로그
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            AUTH Phase-2 · 모든 로그인 시도 기록
          </p>
        </div>
      </div>

      {/* ── 필터 카드 ── */}
      <HBCard variant="elevated">
        <div className="flex flex-wrap gap-4 items-end">
          {/* 기간 필터 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>기간</span>
            <HBTabs
              tabs={PERIOD_TABS}
              active={period}
              onChange={(k) => { setPeriod(k); setPage(1); }}
              size="sm"
            />
          </div>

          {/* 성공/실패 필터 */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>상태</span>
            <HBTabs
              tabs={SUCCESS_TABS}
              active={success}
              onChange={(k) => { setSuccess(k); setPage(1); }}
              size="sm"
            />
          </div>

          {/* 이메일 검색 */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>이메일 검색</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="이메일 부분 검색..."
                value={emailQ}
                onChange={(e) => setEmailQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs(1)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-xl border outline-none w-full"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* 조회 버튼 */}
          <button
            onClick={() => fetchLogs(1)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'var(--royal-blue)', color: '#fff' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            조회
          </button>
        </div>
      </HBCard>

      {/* ── 요약 메트릭 ── */}
      {result && !loading && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: '전체 건수',
              value: result.total.toLocaleString(),
              color: 'var(--text-primary)',
            },
            {
              label: '성공',
              value: result.items.filter(i => i.success).length.toLocaleString() +
                (result.total > PAGE_SIZE ? '+' : ''),
              color: 'var(--accent-gain)',
            },
            {
              label: '실패',
              value: result.items.filter(i => !i.success).length.toLocaleString() +
                (result.total > PAGE_SIZE ? '+' : ''),
              color: 'var(--accent-loss)',
            },
          ].map((m) => (
            <HBCard key={m.label} variant="ghost">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
              <div className="text-2xl font-bold tabular-nums mt-1" style={{ color: m.color }}>
                {m.value}
              </div>
            </HBCard>
          ))}
        </div>
      )}

      {/* ── 테이블 ── */}
      <HBCard variant="default" noPad>
        {/* 테이블 헤더 */}
        <div
          className="grid text-xs font-semibold px-4 py-2 border-b"
          style={{
            gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr',
            color: 'var(--text-muted)',
            borderColor: 'var(--border)',
          }}
        >
          <span>시간</span>
          <span>이메일</span>
          <span>상태</span>
          <span>이벤트</span>
          <span>실패 사유</span>
          <span>IP</span>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <HBSkeleton key={i} variant="text" h={20} />
            ))}
          </div>
        )}

        {/* 에러 */}
        {!loading && fetchErr && (
          <HBError message={fetchErr} onRetry={() => fetchLogs(1)} />
        )}

        {/* 빈 상태 */}
        {!loading && !fetchErr && result && result.items.length === 0 && (
          <HBEmpty
            icon={<Shield size={24} />}
            message="해당 조건의 로그인 기록이 없습니다."
          />
        )}

        {/* 데이터 행 */}
        {!loading && !fetchErr && result && result.items.map((row, idx) => (
          <div
            key={row.id}
            className="grid text-xs px-4 py-2 border-b hover:opacity-80 transition-opacity"
            style={{
              gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr',
              borderColor: 'var(--border)',
              background: idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
            }}
          >
            <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {new Date(row.created_at).toLocaleString('ko-KR', {
                month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
            <span
              className="truncate"
              style={{ color: 'var(--text-primary)' }}
              title={row.email ?? ''}
            >
              {row.email ?? '-'}
            </span>
            <span
              className="font-semibold"
              style={{ color: row.success ? 'var(--accent-gain)' : 'var(--accent-loss)' }}
            >
              {row.success ? '성공' : '실패'}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              {row.event_type ?? 'login'}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {row.failure_reason ?? '-'}
            </span>
            <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {row.ip_address ?? '-'}
            </span>
          </div>
        ))}
      </HBCard>

      {/* ── 페이지네이션 ── */}
      {result && result.total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–
            {Math.min(page * PAGE_SIZE, result.total).toLocaleString()} / {result.total.toLocaleString()}건
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <ChevronLeft size={14} /> 이전
            </button>
            <span className="px-3 py-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold border transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              다음 <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
