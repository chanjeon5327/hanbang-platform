/**
 * ============================================================================
 * 관리자 포렌식 감사 대시보드 (/admin/forensic)
 * ============================================================================
 *
 * [금융감독원 전자금융업 감독규정 준수 사항]
 * 1. 원장(Ledger) SHA-256 해시 체인 무결성 실시간 표시
 * 2. 해시 불일치(mismatch) 감지 시 즉시 경고
 * 3. 최근 24시간 로그인 시도 통계 (성공/실패)
 * 4. 강제 로그아웃 기록 추적
 * 5. 시간별 실패율 그래프 (이상 패턴 시각적 탐지)
 *
 * 이 대시보드는 금융 감독 당국의 현장 검사 시
 * 시스템 무결성을 즉시 증명할 수 있도록 설계되었습니다.
 *
 * ============================================================================
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Users,
  Lock,
  Activity,
} from 'lucide-react';

import type {
  ForensicDashboardData,
  LedgerIntegrityResult,
  LoginStats,
  ForceLogoutRecord,
  HourlyFailureRate,
} from '@/lib/types/financial';

/** 데이터 로딩 상태 */
type LoadState = 'idle' | 'loading' | 'success' | 'error';

export default function ForensicDashboardPage() {
  const [data, setData] = useState<ForensicDashboardData | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoadState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/forensic', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json: ForensicDashboardData = await res.json();
      setData(json);
      setLoadState('success');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '데이터 조회 실패');
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Shield size={28} />
            포렌식 감사 대시보드
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            원장 무결성 · 로그인 감사 · 이상 탐지
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loadState === 'loading'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
        >
          <RefreshCw size={16} className={loadState === 'loading' ? 'animate-spin' : ''} />
          {loadState === 'loading' ? '검증 중...' : '새로고침'}
        </button>
      </div>

      {/* 에러 */}
      {loadState === 'error' && (
        <div
          className="p-4 rounded-xl border flex items-center gap-3"
          style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' }}
        >
          <AlertTriangle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 로딩 */}
      {loadState === 'loading' && !data && (
        <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
          <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
          <p>포렌식 데이터를 검증하고 있습니다...</p>
        </div>
      )}

      {/* 데이터 표시 */}
      {data && (
        <>
          {/* 원장 무결성 섹션 */}
          <LedgerIntegrityCard integrity={data.ledger_integrity} />

          {/* 통계 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LoginStatsCard stats={data.login_stats} />
            <ForceLogoutCard logouts={data.force_logouts} />
            <IntegritySummaryCard integrity={data.ledger_integrity} />
          </div>

          {/* 실패율 그래프 */}
          <FailureRateChart rates={data.hourly_failure_rates} />

          {/* 강제 로그아웃 상세 */}
          <ForceLogoutTable logouts={data.force_logouts} />
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 원장 무결성 카드
 * ───────────────────────────────────────────────── */
function LedgerIntegrityCard({ integrity }: { integrity: LedgerIntegrityResult }) {
  const isOk = integrity.integrity_ok;

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{
        backgroundColor: isOk ? '#f0fdf4' : '#fef2f2',
        borderColor: isOk ? '#bbf7d0' : '#fecaca',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        {isOk ? (
          <ShieldCheck size={32} className="text-green-600" />
        ) : (
          <ShieldAlert size={32} className="text-red-600" />
        )}
        <div>
          <h2 className="text-xl font-bold" style={{ color: isOk ? '#166534' : '#dc2626' }}>
            {isOk ? '원장 무결성 정상' : '원장 무결성 이상 감지'}
          </h2>
          <p className="text-sm" style={{ color: isOk ? '#15803d' : '#b91c1c' }}>
            SHA-256 해시 체인 검증 완료 · {integrity.total_entries.toLocaleString()}건 검사
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBox label="총 엔트리" value={integrity.total_entries.toLocaleString()} />
        <MetricBox
          label="해시 불일치"
          value={integrity.mismatches.toString()}
          alert={integrity.mismatches > 0}
        />
        <MetricBox
          label="체인 단절"
          value={integrity.chain_breaks.toString()}
          alert={integrity.chain_breaks > 0}
        />
        <MetricBox label="검증 시각" value={formatTime(integrity.verified_at)} small />
      </div>

      {integrity.first_mismatch_id && (
        <div className="mt-3 p-3 rounded-lg bg-red-100 text-red-800 text-sm">
          <strong>최초 불일치 엔트리:</strong>{' '}
          <code className="bg-red-200 px-1 rounded">{integrity.first_mismatch_id}</code>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 로그인 통계 카드
 * ───────────────────────────────────────────────── */
function LoginStatsCard({ stats }: { stats: LoginStats }) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users size={20} style={{ color: 'var(--accent-color)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          로그인 시도 (24h)
        </h3>
      </div>
      <div className="space-y-2 text-sm">
        <StatRow label="총 시도" value={stats.total_attempts.toLocaleString()} />
        <StatRow label="성공" value={stats.success_count.toLocaleString()} color="#ef4444" />
        <StatRow label="실패" value={stats.failure_count.toLocaleString()} color="#dc2626" />
        <StatRow
          label="실패율"
          value={`${stats.failure_rate}%`}
          color={stats.failure_rate > 20 ? '#dc2626' : undefined}
        />
        <StatRow label="고유 사용자" value={stats.unique_users.toLocaleString()} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 강제 로그아웃 요약 카드
 * ───────────────────────────────────────────────── */
function ForceLogoutCard({ logouts }: { logouts: ForceLogoutRecord[] }) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Lock size={20} style={{ color: 'var(--accent-color)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          강제 로그아웃
        </h3>
      </div>
      <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {logouts.length}
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        강제 로그아웃 처리된 계정 수
      </p>
      {logouts.length > 0 && (
        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          최근: {logouts[0]?.email ?? logouts[0]?.nickname ?? '알 수 없음'}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 무결성 요약 카드
 * ───────────────────────────────────────────────── */
function IntegritySummaryCard({ integrity }: { integrity: LedgerIntegrityResult }) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity size={20} style={{ color: 'var(--accent-color)' }} />
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          해시 체인 상태
        </h3>
      </div>
      <div
        className="text-3xl font-bold mb-1"
        style={{ color: integrity.integrity_ok ? '#ef4444' : '#dc2626' }}
      >
        {integrity.integrity_ok ? 'PASS' : 'FAIL'}
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {integrity.total_entries.toLocaleString()}개 엔트리 · SHA-256
      </p>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        검증: {formatTime(integrity.verified_at)}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 실패율 그래프
 * ───────────────────────────────────────────────── */
function FailureRateChart({ rates }: { rates: HourlyFailureRate[] }) {
  if (rates.length === 0) {
    return (
      <div
        className="p-6 rounded-2xl border text-center"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          최근 24시간 로그인 데이터가 없습니다.
        </p>
      </div>
    );
  }

  const chartData = rates.map((r) => ({
    hour: r.hour.split('T')[1] ?? r.hour,
    실패율: r.rate,
    총시도: r.total,
    실패: r.failures,
  }));

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        시간별 로그인 실패율 (최근 24시간)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
          <YAxis unit="%" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              fontSize: '13px',
              border: '1px solid #e5e7eb',
            }}
            formatter={(value: number | undefined, name: string | undefined) => {
              const v = value ?? 0;
              if (name === '실패율') return [`${v}%`, name];
              return [v, name ?? ''];
            }}
          />
          <Bar dataKey="실패율" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.실패율 > 30 ? '#dc2626' : entry.실패율 > 10 ? '#f59e0b' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 강제 로그아웃 상세 테이블
 * ───────────────────────────────────────────────── */
function ForceLogoutTable({ logouts }: { logouts: ForceLogoutRecord[] }) {
  if (logouts.length === 0) return null;

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
    >
      <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        강제 로그아웃 기록
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: 'var(--text-secondary)' }}>
              <th className="text-left py-2 px-3">사용자 ID</th>
              <th className="text-left py-2 px-3">이메일</th>
              <th className="text-left py-2 px-3">닉네임</th>
              <th className="text-left py-2 px-3">강제 로그아웃 시각</th>
            </tr>
          </thead>
          <tbody>
            {logouts.map((r, i) => (
              <tr
                key={i}
                className="border-t"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <td className="py-2 px-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {r.user_id.slice(0, 8)}...
                </td>
                <td className="py-2 px-3" style={{ color: 'var(--text-primary)' }}>
                  {r.email ?? '-'}
                </td>
                <td className="py-2 px-3" style={{ color: 'var(--text-primary)' }}>
                  {r.nickname ?? '-'}
                </td>
                <td className="py-2 px-3" style={{ color: 'var(--text-secondary)' }}>
                  {formatDateTime(r.force_logout_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
 * 유틸리티 컴포넌트
 * ───────────────────────────────────────────────── */
function MetricBox({
  label,
  value,
  alert,
  small,
}: {
  label: string;
  value: string;
  alert?: boolean;
  small?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
      <div
        className={`font-bold ${small ? 'text-sm' : 'text-xl'}`}
        style={{ color: alert ? '#dc2626' : 'var(--text-primary)' }}
      >
        {value}
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color: color ?? 'var(--text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

/** 시간 포맷: HH:MM */
function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return iso;
  }
}

/** 날짜시간 포맷: YYYY-MM-DD HH:MM */
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return iso;
  }
}
