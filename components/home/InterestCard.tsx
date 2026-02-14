'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getYtThumb } from '@/lib/thumbnails';
import { useInterestToggle } from '@/hooks/useInterestToggle';
import { useAuth } from '@/components/auth/AuthProvider';

const TOSS = { card: '#ffffff', text: '#191f28', blue: '#3182f6', border: '#e5e8eb' };
const POSITIVE = '#00c48c';

type Props = {
  id?: string;
  thumbUrl?: string;
  title?: string;
  index?: number;
  isInterested?: boolean;
};

export default function InterestCard({ id, thumbUrl, title = '여행가 제이', index, isInterested = false }: Props) {
  const { user } = useAuth();
  const { isInterested: interested, toggle, loading } = useInterestToggle(id, isInterested);
  const src = thumbUrl ?? (index != null ? getYtThumb(index) : getYtThumb(0));

  const content = (
    <>
      <div className="relative h-[100px] bg-[#e5e8eb]">
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
        {user && id && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle();
            }}
            disabled={loading}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm disabled:opacity-50"
            aria-label={interested ? '관심 해제' : '관심 등록'}
          >
            <Heart
              size={16}
              className={interested ? 'fill-red-500 text-red-500' : 'text-white'}
              strokeWidth={2}
            />
          </button>
        )}
      </div>
      <div className="p-3">
        <div className="text-[14px] font-semibold truncate" style={{ color: TOSS.text }}>{title}</div>
        <div className="text-[16px] font-bold mt-1" style={{ color: TOSS.text }}>₩12,300</div>
        <div className="text-[12px] font-medium mt-0.5" style={{ color: POSITIVE }}>+3.2%</div>
        <div className="h-1 bg-[#e5e8eb] rounded-full mt-2">
          <div className="h-1 rounded-full" style={{ width: '68%', backgroundColor: TOSS.blue }} />
        </div>
      </div>
    </>
  );

  if (id) {
    return (
      <Link href={`/market/${id}`} className="block w-[150px] rounded-[16px] overflow-hidden shrink-0 active:scale-[0.98] transition border focus:outline-none focus:ring-2 focus:ring-[var(--toss-blue)] focus:ring-offset-2" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: TOSS.border }}>
        {content}
      </Link>
    );
  }

  return (
    <div className="w-[150px] rounded-[16px] overflow-hidden shrink-0 active:scale-[0.98] transition border" style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderColor: TOSS.border }}>
      {content}
    </div>
  );
}
