export type MarketItem = {
  id: string;
  title: string;
  creator: string;
  category: string;
  price: number;
  chgPct: number; // 전일대비 %
  tagMain: '보장형' | '한정판매형' | '일반형';
  momentum: '급상승' | '상승' | '보합' | '하락' | '급락주의';
  thumbnail: string; // data uri
  deadlineHours?: number;
};

function svgThumb(label: string, a: string, b: string) {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${a}"/>
        <stop offset="1" stop-color="${b}"/>
      </linearGradient>
      <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="18" result="b"/>
        <feMerge>
          <feMergeNode in="b"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="1200" height="800" fill="url(#g)"/>
    <circle cx="980" cy="160" r="120" fill="rgba(255,255,255,0.10)"/>
    <circle cx="1040" cy="240" r="160" fill="rgba(255,255,255,0.06)"/>
    <text x="60" y="650" font-size="64" fill="rgba(255,255,255,0.92)" font-family="Inter, Noto Sans KR, sans-serif" filter="url(#glow)">${label}</text>
    <text x="60" y="720" font-size="28" fill="rgba(255,255,255,0.70)" font-family="Inter, Noto Sans KR, sans-serif">HANBANG • IP Market</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const marketItems: MarketItem[] = [
  { id:'travel-j', title:'여행가 제이', creator:'크리에이터', category:'여행', price:12300, chgPct:2.4, tagMain:'한정판매형', momentum:'급상승', thumbnail: svgThumb('여행가 제이', '#0B1224', '#2563EB'), deadlineHours: 2.2 },
  { id:'chim', title:'침착맨', creator:'크리에이터', category:'토크', price:98120, chgPct:-1.1, tagMain:'일반형', momentum:'하락', thumbnail: svgThumb('침착맨', '#0B1224', '#7C3AED'), deadlineHours: 10.5 },
  { id:'chong', title:'총몇명', creator:'크리에이터', category:'코미디', price:45700, chgPct:0.8, tagMain:'보장형', momentum:'상승', thumbnail: svgThumb('총몇명', '#071021', '#22C55E'), deadlineHours: 6.0 },
  { id:'muklab', title:'먹방연구소', creator:'크리에이터', category:'먹방', price:21050, chgPct:3.2, tagMain:'한정판매형', momentum:'급상승', thumbnail: svgThumb('먹방연구소', '#071021', '#F59E0B'), deadlineHours: 27.2 },

  { id:'sports-pick', title:'스포츠픽', creator:'크리에이터', category:'스포츠', price:67900, chgPct:-0.4, tagMain:'일반형', momentum:'보합', thumbnail: svgThumb('스포츠픽', '#071021', '#06B6D4') },
  { id:'k-drama', title:'K드라마 하이라이트', creator:'스튜디오', category:'드라마', price:55300, chgPct:1.7, tagMain:'보장형', momentum:'상승', thumbnail: svgThumb('K드라마', '#0B1224', '#EC4899') },
  { id:'kpop-stage', title:'K-POP STAGE', creator:'스튜디오', category:'음악', price:73400, chgPct:2.1, tagMain:'한정판매형', momentum:'상승', thumbnail: svgThumb('K-POP STAGE', '#071021', '#A855F7') },
  { id:'food-trip', title:'푸드트립', creator:'크리에이터', category:'먹방', price:18900, chgPct:-2.9, tagMain:'일반형', momentum:'급락주의', thumbnail: svgThumb('푸드트립', '#071021', '#EF4444') },

  { id:'city-walk', title:'도시산책', creator:'크리에이터', category:'여행', price:14200, chgPct:0.2, tagMain:'일반형', momentum:'보합', thumbnail: svgThumb('도시산책', '#0B1224', '#3B82F6') },
  { id:'talk-issue', title:'이슈토크', creator:'크리에이터', category:'시사/토크', price:39800, chgPct:1.0, tagMain:'보장형', momentum:'상승', thumbnail: svgThumb('이슈토크', '#0B1224', '#10B981') },
  { id:'game-lab', title:'게임연구실', creator:'크리에이터', category:'게임', price:41200, chgPct:4.4, tagMain:'한정판매형', momentum:'급상승', thumbnail: svgThumb('게임연구실', '#071021', '#2563EB') },
  { id:'docu-now', title:'다큐NOW', creator:'스튜디오', category:'다큐', price:26500, chgPct:-0.7, tagMain:'일반형', momentum:'하락', thumbnail: svgThumb('다큐NOW', '#071021', '#64748B') },

  { id:'comedy-cut', title:'코미디컷', creator:'크리에이터', category:'코미디', price:22900, chgPct:2.9, tagMain:'보장형', momentum:'상승', thumbnail: svgThumb('코미디컷', '#071021', '#F97316') },
  { id:'beauty-talk', title:'뷰티톡', creator:'크리에이터', category:'뷰티', price:17700, chgPct:1.3, tagMain:'일반형', momentum:'상승', thumbnail: svgThumb('뷰티톡', '#071021', '#EC4899') },
  { id:'kids-world', title:'키즈월드', creator:'스튜디오', category:'키즈', price:30200, chgPct:0.6, tagMain:'보장형', momentum:'보합', thumbnail: svgThumb('키즈월드', '#071021', '#22C55E') },
  { id:'history-lab', title:'역사연구소', creator:'스튜디오', category:'교양', price:31800, chgPct:-1.8, tagMain:'일반형', momentum:'하락', thumbnail: svgThumb('역사연구소', '#071021', '#A3A3A3') },

  { id:'cinema-buster', title:'영화 블록버스터', creator:'스튜디오', category:'영화', price:88900, chgPct:3.5, tagMain:'한정판매형', momentum:'급상승', thumbnail: svgThumb('영화 블록버스터', '#0B1224', '#F59E0B') },
  { id:'sports-live', title:'스포츠 LIVE', creator:'스튜디오', category:'스포츠', price:60500, chgPct:1.2, tagMain:'보장형', momentum:'상승', thumbnail: svgThumb('스포츠 LIVE', '#0B1224', '#06B6D4') },
  { id:'travel-asia', title:'아시아여행', creator:'크리에이터', category:'여행', price:15800, chgPct:-0.2, tagMain:'일반형', momentum:'보합', thumbnail: svgThumb('아시아여행', '#0B1224', '#3B82F6') },
  { id:'muk-star', title:'먹스타', creator:'크리에이터', category:'먹방', price:24800, chgPct:2.0, tagMain:'보장형', momentum:'상승', thumbnail: svgThumb('먹스타', '#0B1224', '#F59E0B') },
];

export function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n);
}
