'use client';

import Link from 'next/link';

type HeroItem = {
  id: string;
  title: string;
  subtitle?: string;
  thumbUrl?: string;
  score?: number;
};

type Props = { item?: HeroItem | null };

const DEFAULT_HERO: HeroItem = {
  id: 'hero-default',
  title: '디지털 IP 수익권',
  subtitle: '수익을 조각으로 투자·거래',
  thumbUrl: '',
};

const TOSS = { card: '#ffffff', border: '#e5e8eb', blue: '#3182f6', text: '#191f28', dim: '#6b7684' } as const;

export default function HomeHero({ item }: Props) {
  const hero = item ?? DEFAULT_HERO;
  const href = hero.id !== 'hero-default' ? `/market/${hero.id}` : '/';

  return (
    <section className="pt-2">
      <Link
        href={href}
        className="block relative w-full h-[140px] overflow-hidden rounded-2xl border border-black/5 active:scale-[0.99] transition-transform duration-200"
        style={{ backgroundColor: TOSS.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {hero.thumbUrl && (
          <div className="absolute inset-0">
            <img src={hero.thumbUrl} alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center px-5">
          <div>
            <h1 className="text-[18px] font-bold leading-tight" style={{ color: TOSS.text }}>{hero.title}</h1>
            {hero.subtitle && <p className="mt-0.5 text-[13px]" style={{ color: TOSS.dim }}>{hero.subtitle}</p>}
            <div className="mt-3 inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[12px] font-bold text-white" style={{ backgroundColor: TOSS.blue }}>
              살펴보기 →
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
