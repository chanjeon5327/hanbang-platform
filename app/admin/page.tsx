'use client';

import Link from 'next/link';
import { DollarSign, Users, Percent, FileText } from 'lucide-react';

/**
 * 리포트 대시보드
 * - 총 매출, 총 수수료, 활성 유저 수, 모집 성공률, 최근 정산 내역
 */
const MOCK_KPI = {
  totalSales: 125_000_000,
  totalFees: 6_250_000,
  activeUsers: 3420,
  mobilizationRate: 78.5,
};

const MOCK_SETTLEMENTS = [
  { id: '1', date: '2024-01-15', amount: 12_500_000, status: 'confirmed' },
  { id: '2', date: '2024-01-14', amount: 8_200_000, status: 'confirmed' },
  { id: '3', date: '2024-01-13', amount: 15_100_000, status: 'confirmed' },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>리포트 대시보드</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} style={{ color: 'var(--accent-color)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>총 매출</span>
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {(MOCK_KPI.totalSales / 1_000_000).toFixed(1)}백만원
          </div>
        </div>
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} style={{ color: 'var(--accent-color)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>총 수수료</span>
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {(MOCK_KPI.totalFees / 1_000_000).toFixed(2)}백만원
          </div>
        </div>
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} style={{ color: 'var(--accent-color)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>활성 유저</span>
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {MOCK_KPI.activeUsers.toLocaleString()}명
          </div>
        </div>
        <div
          className="p-5 rounded-2xl border"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Percent size={18} style={{ color: 'var(--accent-color)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>모집 성공률</span>
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {MOCK_KPI.mobilizationRate}%
          </div>
        </div>
      </div>

      {/* 최근 정산 내역 */}
      <div
        className="p-6 rounded-2xl border"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>최근 정산 내역</h2>
          <Link href="/admin/settlement" className="text-sm font-semibold" style={{ color: 'var(--accent-color)' }}>전체보기</Link>
        </div>
        <div className="space-y-3">
          {MOCK_SETTLEMENTS.map((s) => (
            <Link
              key={s.id}
              href={`/admin/settlement/${s.id}`}
              className="flex justify-between items-center p-3 rounded-xl hover:bg-black/5 transition"
            >
              <div>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.date}</span>
                <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>{s.status === 'confirmed' ? '확정됨' : '대기'}</span>
              </div>
              <span className="font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {s.amount.toLocaleString()}원
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
