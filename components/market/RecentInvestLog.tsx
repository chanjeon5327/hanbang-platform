'use client';

const TOSS = {
  text: '#191f28',
  secondary: '#6b7684',
} as const;

export type InvestLogItem = {
  nickname: string;
  amount: number;
  created_at: string;
};

function maskNickname(nick: string): string {
  if (!nick || nick.length < 2) return '***';
  return nick[0] + '**';
}

function formatTimeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return '방금 전';
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatAmount(n: number): string {
  return `₩${(n / 10000).toFixed(0)}만`;
}

type Props = {
  items: InvestLogItem[];
};

export default function RecentInvestLog({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <div className="bg-white pt-4" style={{ borderTop: '1px solid var(--upbit-border)' }}>
      <div className="px-0 pb-3">
        <h3 className="text-[14px] font-bold" style={{ color: TOSS.text }}>최근 참여</h3>
      </div>
      <ul className="divide-y" style={{ borderColor: 'var(--upbit-border)' }}>
        {items.map((log, i) => (
          <li key={i} className="flex justify-between items-center gap-2 py-2.5">
            <span className="text-[13px] shrink-0" style={{ color: TOSS.secondary }}>{maskNickname(log.nickname)}</span>
            <span className="text-[13px] font-semibold tabular-nums truncate" style={{ color: TOSS.text }}>{formatAmount(log.amount)}</span>
            <span className="text-[11px] shrink-0" style={{ color: TOSS.secondary }}>{formatTimeAgo(log.created_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
