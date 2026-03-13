export type MarketItem = {
  id: string;
  title: string;
  creator: string;
  category: string;
  price: number;
  chgPct: number;
  tagMain: '보장형' | '한정판매형' | '일반형';
  momentum: '급상승' | '상승' | '보합' | '하락' | '급락주의';
  thumbnail: string;
  deadlineHours?: number;
  // 상세 페이지 전용 필드
  annualReturn?: number;       // 예상 연수익률 (%)
  soldPct?: number;            // 판매 완료율 (%)
  overview?: string;
  target_audience?: string;
  revenue_model?: string;
  investment_points?: string[];
  risk_points?: string[];
  roadmap_items?: string[];
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
    <circle cx="200" cy="600" r="90" fill="rgba(255,255,255,0.05)"/>
    <text x="60" y="650" font-size="64" fill="rgba(255,255,255,0.92)" font-family="Inter, Noto Sans KR, sans-serif" filter="url(#glow)">${label}</text>
    <text x="60" y="720" font-size="28" fill="rgba(255,255,255,0.60)" font-family="Inter, Noto Sans KR, sans-serif">HANBANG · IP Market</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const marketItems: MarketItem[] = [
  {
    id: 'travel-j',
    title: '블루웨이 시즌3',
    creator: '여행가 제이',
    category: '여행',
    price: 12300,
    chgPct: 2.4,
    tagMain: '한정판매형',
    momentum: '급상승',
    thumbnail: svgThumb('블루웨이 시즌3', '#0B1224', '#2563EB'),
    deadlineHours: 2.2,
    annualReturn: 14.2,
    soldPct: 78,
    overview:
      '국내 최초 여행 크리에이터 여행가 제이의 프리미엄 여행 브이로그 시리즈. 동남아·유럽·일본 3개 권역을 6개월간 깊게 탐방하며 제작하는 장기 시즌 콘텐츠입니다.',
    target_audience: '20~35세 여행 관심층, 콘텐츠 소비가 활발한 MZ세대 및 해외여행 준비자',
    revenue_model:
      '유튜브 광고 수익 + 여행사·숙박 브랜드 협찬 + 멤버십 구독료의 일정 비율을 분기마다 보유자에게 정기 배분합니다.',
    investment_points: [
      '동남아·유럽 여행 수요 회복 이후 관련 콘텐츠 조회수가 업계 평균 대비 2.3배 성장 중입니다.',
      '구독자 150만 돌파로 광고 단가가 프리미엄 구간에 진입했으며, 브랜드 협찬 단가도 42% 상승했습니다.',
      '시즌1·2 정산 결과 목표 수익률을 11% 초과 달성해 신뢰 이력을 보유하고 있습니다.',
    ],
    risk_points: [
      '조회수가 플랫폼 알고리즘 변화에 민감하게 반응할 수 있어 분기별 수익이 변동될 수 있습니다.',
      '촬영·제작 일정 지연 시 에피소드 배포가 늦어질 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 동남아 3개 도시 에피소드 8편 제작·배포 + 첫 분기 중간 정산',
      '2분기: 유럽 투어 에피소드 6편 배포 + 구독 멤버십 론칭',
      '3분기: 일본·대만 편 + 브랜드 콜라보 기획 확정 및 발표',
      '4분기: 시즌3 최종 정산 + 투자자 리포트 발행 + 시즌4 예고',
    ],
  },
  {
    id: 'chim',
    title: '라운지 나인',
    creator: '침착맨 스튜디오',
    category: '토크',
    price: 98120,
    chgPct: -1.1,
    tagMain: '일반형',
    momentum: '하락',
    thumbnail: svgThumb('라운지 나인', '#0B1224', '#7C3AED'),
    deadlineHours: 10.5,
    annualReturn: 9.8,
    soldPct: 92,
    overview:
      '100만+ 구독자 방송인이 운영하는 심야 토크·버라이어티 채널. 주 1회 정기편성으로 안정적인 시청층을 보유하며, 꾸준한 광고 수익을 기록 중입니다.',
    target_audience: '25~40세 직장인, 심야 감성 토크 콘텐츠 선호층',
    revenue_model:
      '유튜브 광고 수익 + 라이브 슈퍼챗 + 채널 멤버십 구독료를 분기별 보유자에게 배분합니다.',
    investment_points: [
      '주 1회 정기편성으로 광고 수익이 계절·이슈와 무관하게 안정적으로 발생합니다.',
      '멤버십 전환율 2.1%로 동종 채널 평균(1.2%) 대비 75% 높습니다.',
    ],
    risk_points: [
      '인기 크리에이터 개인 의존도가 높아 건강·이슈 발생 시 채널 운영에 영향이 생길 수 있습니다.',
      '심야 타겟 특성상 광고주 카테고리가 제한적이어서 단가 변동이 있을 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 기존 VOD 아카이브 전용 구독 상품 출시',
      '2분기: 게스트 확대 편성으로 화제성 제고 + 첫 정산',
      '3분기: 팬 밋업 이벤트 + MD 협찬 수익 편입',
      '4분기: 멤버십 전용 콘텐츠 확장 + 연간 정산 리포트',
    ],
  },
  {
    id: 'chong',
    title: '총몇명',
    creator: '코미디 팩토리',
    category: '코미디',
    price: 45700,
    chgPct: 0.8,
    tagMain: '보장형',
    momentum: '상승',
    thumbnail: svgThumb('총몇명', '#071021', '#22C55E'),
    deadlineHours: 6.0,
    annualReturn: 11.5,
    soldPct: 61,
    overview:
      '구독자 300만 코미디 채널의 단편 콘텐츠 IP. 짧고 강한 포맷으로 알고리즘 단기 확산에 최적화되어 있으며, 리메이크·IP 라이선싱 수익 구조를 보유합니다.',
    target_audience: '10~30세 숏폼 선호층, 가벼운 오락 콘텐츠 수요자',
    revenue_model:
      '광고 수익 + 숏폼 플랫폼 파트너십 수익 + IP 라이선싱 수익을 연 2회 정산합니다.',
    investment_points: [
      '숏폼 알고리즘 최적화 콘텐츠로 영상 1편당 평균 조회수가 250만 뷰 이상 달성합니다.',
      '보장형 구조로 최소 수익률이 보장되어 하방 리스크가 제한됩니다.',
    ],
    risk_points: [
      '숏폼 플랫폼의 수익 정책 변경 시 배분 금액이 변동될 수 있습니다.',
      'IP 라이선싱 계약 체결 여부에 따라 수익 시기가 달라질 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 신규 에피소드 24편 제작 + 숏폼 파트너십 확장',
      '2분기: IP 라이선싱 계약 2건 목표 체결',
      '3분기: 첫 연간 정산 + 투자자 공개 리포트',
      '4분기: 시즌2 기획 확정 및 사전 판매',
    ],
  },
  {
    id: 'muklab',
    title: '테이블 로그',
    creator: '먹방연구소',
    category: '먹방',
    price: 21050,
    chgPct: 3.2,
    tagMain: '한정판매형',
    momentum: '급상승',
    thumbnail: svgThumb('테이블 로그', '#071021', '#F59E0B'),
    deadlineHours: 27.2,
    annualReturn: 16.3,
    soldPct: 55,
    overview:
      '국내 대형 먹방 유튜버 먹방연구소의 정통 레스토랑 탐방 시리즈. 미쉐린 가이드 수록 식당부터 골목 숨은 맛집까지 연간 48편 이상 제작됩니다.',
    target_audience: '25~45세 식도락 관심층, 외식업 종사자 및 음식 콘텐츠 소비자',
    revenue_model:
      '광고 수익 + 레스토랑 협찬 수익 + 레시피 유료 컨텐츠 수익을 분기별 배분합니다.',
    investment_points: [
      '먹방 카테고리는 K-콘텐츠 수출 확대와 맞물려 해외 구독자가 빠르게 성장 중입니다.',
      '레스토랑 협찬 단가가 직전 시즌 대비 58% 상승하며 수익 구조가 강화되었습니다.',
      '한정 판매로 희소성이 높아 2차 거래 프리미엄이 형성될 가능성이 있습니다.',
    ],
    risk_points: [
      '식당 운영 변화(폐업·메뉴 변경)로 특정 에피소드의 흥행이 달라질 수 있습니다.',
      '해외 구독자 비중이 높아질수록 수익 통화 환산 리스크가 발생합니다.',
    ],
    roadmap_items: [
      '1분기: 미쉐린 서울 2024 수록 식당 탐방 12편 제작·배포',
      '2분기: 레시피 유료 콘텐츠 론칭 + 첫 정산',
      '3분기: 일본·홍콩 해외 편 확장',
      '4분기: 시즌 결산 + 시즌2 사전 예약 판매',
    ],
  },

  {
    id: 'sports-pick',
    title: '스포츠픽',
    creator: '스포츠미디어랩',
    category: '스포츠',
    price: 67900,
    chgPct: -0.4,
    tagMain: '일반형',
    momentum: '보합',
    thumbnail: svgThumb('스포츠픽', '#071021', '#06B6D4'),
    annualReturn: 8.4,
    soldPct: 44,
    overview: '국내 주요 스포츠 경기 하이라이트 및 분석 콘텐츠. 프로야구·축구·농구 시즌에 맞춰 편성이 증가합니다.',
    target_audience: '20~50세 스포츠 팬, 경기 분석 콘텐츠 수요자',
    revenue_model: '광고 수익 + 스포츠 브랜드 협찬 + 유료 분석 콘텐츠 수익을 시즌 단위로 정산합니다.',
    investment_points: [
      '스포츠 시즌(3~10월) 집중 수익으로 연 단위 수익 예측이 용이합니다.',
      '국내 최대 스포츠 채널 중 하나로 광고주 풀이 다양합니다.',
    ],
    risk_points: [
      '비시즌 기간에는 콘텐츠 수와 수익이 크게 줄어들 수 있습니다.',
      '스포츠 중계권 규정 변경 시 하이라이트 제작에 제한이 생길 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 스프링 시즌 개막 특집 + 광고 단가 재협상',
      '2~3분기: 메인 시즌 집중 편성 + 상반기 정산',
      '4분기: 오프시즌 분석 특집 + 연간 정산',
    ],
  },
  {
    id: 'k-drama',
    title: 'K드라마 하이라이트',
    creator: '스튜디오 웨이브',
    category: '드라마',
    price: 55300,
    chgPct: 1.7,
    tagMain: '보장형',
    momentum: '상승',
    thumbnail: svgThumb('K드라마', '#0B1224', '#EC4899'),
    annualReturn: 10.2,
    soldPct: 69,
    overview: '국내외 OTT 히트 드라마의 공식 하이라이트·비하인드 콘텐츠. OTT 제작사와 라이선스 계약 하에 제작됩니다.',
    target_audience: '20~45세 K-드라마 팬, 글로벌 K-콘텐츠 관심층',
    revenue_model: '라이선스 수익 배분 + 광고 수익 + 해외 플랫폼 파트너십 수익을 분기별 정산합니다.',
    investment_points: [
      'K-드라마의 글로벌 수요가 지속 증가하며 해외 광고 단가가 상승 중입니다.',
      '보장형 구조로 최소 수익이 설정되어 하방 리스크가 낮습니다.',
    ],
    risk_points: [
      '특정 드라마 흥행 실패 시 해당 에피소드 수익이 기대치를 하회할 수 있습니다.',
      'OTT 제작사의 정책 변경 시 라이선스 계약 조건이 조정될 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 신규 라이선스 드라마 3편 계약 체결',
      '2분기: 해외 플랫폼 파트너십 론칭',
      '3분기: 하반기 히트작 집중 편성 + 정산',
      '4분기: 연간 결산 + 신규 시즌 계획 발표',
    ],
  },
  {
    id: 'kpop-stage',
    title: '사운드 플로어',
    creator: 'K-POP STAGE',
    category: '음악',
    price: 73400,
    chgPct: 2.1,
    tagMain: '한정판매형',
    momentum: '상승',
    thumbnail: svgThumb('사운드 플로어', '#071021', '#A855F7'),
    annualReturn: 13.7,
    soldPct: 82,
    overview: 'K-POP 아이돌 퍼포먼스 영상 및 음원 IP. 팬덤 수요와 스트리밍 수익 모두를 포괄하는 이중 수익 구조입니다.',
    target_audience: '15~35세 K-POP 팬덤, 음악 콘텐츠 소비자',
    revenue_model: '음원 스트리밍 수익 + 뮤직비디오 광고 수익 + 팬 이벤트 수익을 분기별 배분합니다.',
    investment_points: [
      'K-POP 팬덤은 집중적이고 지속적인 스트리밍 패턴을 보여 수익 안정성이 높습니다.',
      '해외 팬덤 비중이 높아 달러/엔 기반 수익 유입이 강합니다.',
    ],
    risk_points: [
      '아이돌 그룹의 활동 일정 변경 시 신규 콘텐츠 공급이 지연될 수 있습니다.',
      '팬덤 규모가 줄어들면 스트리밍 수익도 함께 하락할 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 신규 아티스트 IP 계약 2건',
      '2분기: 컴백 시즌 집중 편성 + 팬 이벤트 수익 편입',
      '3분기: 글로벌 투어 연계 콘텐츠 제작',
      '4분기: 연간 정산 + 신규 아티스트 공개 예고',
    ],
  },
  {
    id: 'food-trip',
    title: '푸드트립',
    creator: '길 위의 맛',
    category: '먹방',
    price: 18900,
    chgPct: -2.9,
    tagMain: '일반형',
    momentum: '급락주의',
    thumbnail: svgThumb('푸드트립', '#071021', '#EF4444'),
    annualReturn: 6.1,
    soldPct: 38,
    overview: '지역 맛집 기행 및 로드푸드 전문 채널. 국내 지방 소도시를 중심으로 숨겨진 맛집을 발굴하는 콘텐츠입니다.',
    target_audience: '30~55세 지역 관광 관심층, 다큐 형식 선호 시청자',
    revenue_model: '광고 수익 + 지자체 관광 협찬 수익을 연 2회 정산합니다.',
    investment_points: [
      '지자체 협찬 단가가 꾸준히 상승하며 안정적인 수익원 역할을 합니다.',
    ],
    risk_points: [
      '현재 조회수 하락 추세로 광고 수익이 줄어들 가능성이 있습니다.',
      '로케이션 기반 콘텐츠이므로 날씨·이동 제약에 따라 제작 일정이 유동적입니다.',
    ],
    roadmap_items: [
      '1분기: 포맷 리뉴얼 및 구독자 재유입 캠페인',
      '2분기: 지자체 협찬 계약 확대',
      '3분기: 글로벌 관광지 편 테스트 제작',
      '4분기: 리뉴얼 결과 정산 및 전략 재수립',
    ],
  },

  { id: 'city-walk', title: '도시산책', creator: '어반워크', category: '여행', price: 14200, chgPct: 0.2, tagMain: '일반형', momentum: '보합', thumbnail: svgThumb('도시산책', '#0B1224', '#3B82F6'), annualReturn: 7.5, soldPct: 32, overview: '국내외 도시를 조용히 걷는 힐링 브이로그 채널. ASMR 감성과 여행 정보를 결합한 슬로우 콘텐츠입니다.', target_audience: '20~40세 힐링 콘텐츠 선호층, 명상·ASMR 수요자', revenue_model: '광고 수익 + 구독 멤버십 수익을 분기별 배분합니다.', investment_points: ['힐링·ASMR 카테고리가 꾸준히 성장하며 장기적 수요가 안정적입니다.'], risk_points: ['슬로우 콘텐츠 특성상 알고리즘 추천 빈도가 낮을 수 있습니다.'], roadmap_items: ['1분기: 유럽 도시 편 제작', '2분기: 멤버십 론칭 + 정산'] },
  { id: 'talk-issue', title: '이슈토크', creator: '토크포인트', category: '시사/토크', price: 39800, chgPct: 1.0, tagMain: '보장형', momentum: '상승', thumbnail: svgThumb('이슈토크', '#0B1224', '#10B981'), annualReturn: 9.2, soldPct: 57, overview: '사회 이슈와 경제 트렌드를 쉽게 풀어주는 토크 채널. 보장형 구조로 안정적인 수익을 제공합니다.', target_audience: '25~45세 뉴스 관심층, 경제·사회 이슈 소비자', revenue_model: '광고 수익 + 유료 뉴스레터 수익을 분기별 배분합니다.', investment_points: ['보장형 구조로 최소 수익이 보장됩니다.', '시사 콘텐츠 특성상 이슈 발생 시 트래픽이 급증합니다.'], risk_points: ['정치적 민감 이슈 다루는 경우 광고주 이탈 가능성이 있습니다.'], roadmap_items: ['1분기: 뉴스레터 구독자 1만 목표', '2분기: 정산 및 플랫폼 확장'] },
  { id: 'game-lab', title: '게임연구실', creator: '게임로직', category: '게임', price: 41200, chgPct: 4.4, tagMain: '한정판매형', momentum: '급상승', thumbnail: svgThumb('게임연구실', '#071021', '#2563EB'), deadlineHours: 47.5, annualReturn: 17.8, soldPct: 88, overview: '게임 공략·리뷰·이스터에그 전문 채널. 게임 출시 사이클에 맞춘 콘텐츠 집중 편성으로 조회수가 급증합니다.', target_audience: '15~30세 게이머, 게임 정보 콘텐츠 수요자', revenue_model: '광고 수익 + 게임사 협찬 수익 + 라이브 슈퍼챗 수익을 분기별 배분합니다.', investment_points: ['신작 출시 기간 집중 편성으로 조회수가 최대 8배 급증합니다.', '게임사 공식 협찬 채널로 선정되어 독점 콘텐츠를 확보하고 있습니다.'], risk_points: ['게임 흥행 실패 시 관련 콘텐츠 조회수가 크게 줄어들 수 있습니다.'], roadmap_items: ['1분기: 신작 게임 2편 협찬 계약', '2분기: 공략 유료 구독 론칭', '3분기: e스포츠 관련 편성 확대'] },
  { id: 'docu-now', title: '다큐NOW', creator: '스튜디오 리얼', category: '다큐', price: 26500, chgPct: -0.7, tagMain: '일반형', momentum: '하락', thumbnail: svgThumb('다큐NOW', '#071021', '#64748B'), annualReturn: 6.9, soldPct: 28, overview: '사회·환경·인물을 조명하는 미니 다큐멘터리 채널. 편당 15~25분 분량으로 꾸준히 제작됩니다.', target_audience: '30~55세 다큐 선호층, 사회 이슈 관심 시청자', revenue_model: '광고 수익 + 공공기관 협찬 수익을 반기별 배분합니다.', investment_points: ['공공기관 협찬이 안정적인 수익 기반을 형성합니다.'], risk_points: ['다큐멘터리 특성상 알고리즘 노출이 제한적입니다.'], roadmap_items: ['1분기: 환경 특집 시리즈 제작', '2분기: 공공기관 협찬 계약 갱신'] },

  { id: 'comedy-cut', title: '코미디컷', creator: '개그스튜디오', category: '코미디', price: 22900, chgPct: 2.9, tagMain: '보장형', momentum: '상승', thumbnail: svgThumb('코미디컷', '#071021', '#F97316'), deadlineHours: 72.0, annualReturn: 12.1, soldPct: 64, overview: '국내 인기 코미디언들이 참여하는 숏 스케치 코미디 채널. 주 3편 정기 업로드로 구독자 충성도가 높습니다.', target_audience: '10~35세 가벼운 오락 콘텐츠 선호층', revenue_model: '광고 수익 + 유료 스트리밍 수익 배분.', investment_points: ['주 3편 정기편성으로 수익이 꾸준히 발생합니다.', '보장형 구조로 최소 수익률이 보장됩니다.'], risk_points: ['코미디언 스케줄 변경 시 편성 지연이 생길 수 있습니다.'], roadmap_items: ['1분기: 신규 코미디언 영입', '2분기: 시즌 정산 + 확장편 기획'] },
  { id: 'beauty-talk', title: '뷰티톡', creator: '뷰티랩 크루', category: '뷰티', price: 17700, chgPct: 1.3, tagMain: '일반형', momentum: '상승', thumbnail: svgThumb('뷰티톡', '#071021', '#EC4899'), annualReturn: 10.6, soldPct: 51, overview: '국내외 뷰티 브랜드 리뷰 및 뷰티 트렌드 분석 채널. 뷰티 시장 성장과 함께 광고 단가가 꾸준히 상승 중입니다.', target_audience: '20~40세 뷰티 관심층, 제품 구매 전 리뷰 소비자', revenue_model: '뷰티 브랜드 협찬 수익 + 광고 수익을 분기별 배분합니다.', investment_points: ['K-뷰티 글로벌 수요 확대로 해외 협찬 단가가 오르고 있습니다.'], risk_points: ['특정 브랜드 이슈 발생 시 협찬 계약이 취소될 수 있습니다.'], roadmap_items: ['1분기: 해외 뷰티 브랜드 협찬 2건 계약', '2분기: 정산 + 뷰티 클래스 수익 편입'] },
  { id: 'kids-world', title: '키즈월드', creator: '스튜디오 키즈', category: '키즈', price: 30200, chgPct: 0.6, tagMain: '보장형', momentum: '보합', thumbnail: svgThumb('키즈월드', '#071021', '#22C55E'), annualReturn: 8.8, soldPct: 46, overview: '3~10세 아동 대상 교육·놀이 콘텐츠 전문 채널. 학부모 신뢰가 높고 반복 시청률이 높아 광고 단가가 안정적입니다.', target_audience: '3~10세 아동 및 그 부모, 교육 콘텐츠 구매자', revenue_model: '광고 수익 + 교육 콘텐츠 유료 판매 수익을 분기별 배분합니다.', investment_points: ['보장형 구조로 최소 수익이 보장됩니다.', '반복 시청 비율이 높아 광고 수익이 안정적으로 발생합니다.'], risk_points: ['아동 대상 콘텐츠 규제 강화 시 광고 수익에 영향을 줄 수 있습니다.'], roadmap_items: ['1분기: 교육 콘텐츠 신규 라인업 제작', '2분기: 유료 클래스 론칭 + 정산'] },
  { id: 'history-lab', title: '역사연구소', creator: '역사미디어', category: '교양', price: 31800, chgPct: -1.8, tagMain: '일반형', momentum: '하락', thumbnail: svgThumb('역사연구소', '#071021', '#A3A3A3'), annualReturn: 5.9, soldPct: 22, overview: '국내외 역사와 문화유산을 쉽게 풀어주는 교양 채널. 교육기관 협찬 수익이 주요 수입원입니다.', target_audience: '30~60세 역사·교양 콘텐츠 선호층', revenue_model: '광고 수익 + 교육기관 협찬 수익을 반기별 배분합니다.', investment_points: ['교육기관 협찬이 안정적인 수익 기반을 형성합니다.'], risk_points: ['현재 조회수 하락 추세로 수익 회복에 시간이 걸릴 수 있습니다.'], roadmap_items: ['1분기: 포맷 리뉴얼', '2분기: 교육기관 협찬 갱신 + 정산'] },

  {
    id: 'cinema-buster',
    title: '필름 하우스',
    creator: '씨네클럽',
    category: '영화',
    price: 88900,
    chgPct: 3.5,
    tagMain: '한정판매형',
    momentum: '급상승',
    thumbnail: svgThumb('필름 하우스', '#0B1224', '#F59E0B'),
    deadlineHours: 15.8,
    annualReturn: 15.6,
    soldPct: 91,
    overview:
      '국내외 개봉 영화 리뷰 및 영화사 공식 협찬 채널. 개봉 시즌마다 조회수가 급증하며 한정 판매로 희소성이 높습니다.',
    target_audience: '15~45세 영화 팬, 개봉 전 정보 탐색 소비자',
    revenue_model: '영화사 공식 협찬 수익 + 광고 수익을 분기별 배분합니다.',
    investment_points: [
      '여름·연말 대형 개봉 시즌마다 조회수가 최대 5배 급증합니다.',
      '영화사 공식 협찬으로 독점 인터뷰·비하인드 콘텐츠 확보 중입니다.',
    ],
    risk_points: [
      '대형 흥행작 부재 시 특정 분기 수익이 낮아질 수 있습니다.',
    ],
    roadmap_items: [
      '1분기: 봄 개봉작 집중 편성',
      '2분기: 여름 시즌 특집 + 정산',
      '3분기: 해외 영화제 취재 편 제작',
      '4분기: 연말 시즌 특집 + 연간 정산',
    ],
  },
  { id: 'sports-live', title: '스포츠 LIVE', creator: '스포츠컴퍼니', category: '스포츠', price: 60500, chgPct: 1.2, tagMain: '보장형', momentum: '상승', thumbnail: svgThumb('스포츠 LIVE', '#0B1224', '#06B6D4'), annualReturn: 9.5, soldPct: 58, overview: '실시간 스포츠 경기 리뷰 및 하이라이트 채널. 주요 리그 시즌에 맞춰 집중 편성합니다.', target_audience: '20~45세 스포츠 팬', revenue_model: '광고 수익 + 스포츠 브랜드 협찬 수익 분기별 배분.', investment_points: ['보장형 구조로 최소 수익 보장.'], risk_points: ['비시즌 기간 수익 감소 가능.'], roadmap_items: ['1분기: 시즌 개막 특집', '2분기: 정산'] },
  { id: 'travel-asia', title: '아시아여행', creator: '아시아로', category: '여행', price: 15800, chgPct: -0.2, tagMain: '일반형', momentum: '보합', thumbnail: svgThumb('아시아여행', '#0B1224', '#3B82F6'), annualReturn: 7.2, soldPct: 34, overview: '동남아·동북아 중심의 여행 브이로그. 항공·호텔 협찬 수익이 주요 수입원입니다.', target_audience: '20~40세 여행 관심층', revenue_model: '여행사·호텔 협찬 수익 + 광고 수익 분기별 배분.', investment_points: ['여행 수요 회복과 함께 협찬 단가가 상승 중입니다.'], risk_points: ['특정 지역 이슈(자연재해·정세 불안) 발생 시 제작이 중단될 수 있습니다.'], roadmap_items: ['1분기: 동남아 편 제작', '2분기: 정산'] },
  { id: 'muk-star', title: '먹스타', creator: '먹킹', category: '먹방', price: 24800, chgPct: 2.0, tagMain: '보장형', momentum: '상승', thumbnail: svgThumb('먹스타', '#0B1224', '#F59E0B'), deadlineHours: 38.0, annualReturn: 11.3, soldPct: 63, overview: '대용량·도전 먹방 전문 채널. 극한 먹방 포맷으로 알고리즘 추천을 지속적으로 받고 있습니다.', target_audience: '15~30세 먹방 콘텐츠 소비자', revenue_model: '광고 수익 + 식품 브랜드 협찬 수익 분기별 배분.', investment_points: ['보장형 구조로 최소 수익 보장.', '식품 협찬 단가가 꾸준히 상승 중입니다.'], risk_points: ['크리에이터 개인 이슈 발생 시 채널 이미지에 영향이 생길 수 있습니다.'], roadmap_items: ['1분기: 신규 도전 먹방 포맷 시리즈', '2분기: 정산'] },
];

export function formatKRW(n: number) {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(n);
}
