export type DetailCategory =
  | 'youtube'
  | 'webtoon'
  | 'webnovel'
  | 'music'
  | 'sports'
  | 'default'

export type DetailMetric = {
  label: string
  value: string
}

export type DetailTemplate = {
  category: DetailCategory
  categoryLabel: string
  oneLiner: string
  spotlightTitle: string
  spotlightItems: DetailMetric[]
  investmentPoints: string[]
  riskPoints: string[]
  revenueTitle: string
  revenueDescription: string
  recentPerformance: string[]
  roadmap: string[]
}

export type MarketDetailLike = Record<string, unknown> & {
  title?: string
  name?: string
  category?: string
  content_type?: string
  creator?: string
  creator_name?: string
  channel_name?: string
  artist_name?: string
  team_name?: string
  platform?: string
  platform_name?: string
  target_audience?: string
  fandom?: string
  upload_frequency?: string
  subscriber_count?: number | string
  view_count?: number | string
  monthly_view_count?: number | string
  episode_count?: number | string
  release_count?: number | string
  schedule?: string
  latest_price?: number | string
  last_price?: number | string
  share_price_krw?: number | string
  share_price_usd?: number | string
  volume?: number | string
  monthly_revenue_krw?: number | string
  revenue_model?: string
  risk_note?: string
  roadmap?: string
}

function safeString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim()
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : null
  }
  return null
}

function formatNumber(value: unknown, fallback = '집계 중'): string {
  const num = safeNumber(value)
  if (num === null) return fallback
  return new Intl.NumberFormat('ko-KR').format(num)
}

function formatCurrencyKRW(value: unknown, fallback = '산정 중'): string {
  const num = safeNumber(value)
  if (num === null) return fallback
  return `${new Intl.NumberFormat('ko-KR').format(Math.round(num))}원`
}

function getTitle(item: MarketDetailLike): string {
  return (
    safeString(item.title) ||
    safeString(item.name) ||
    '대표 IP 자산'
  )
}

function getCreator(item: MarketDetailLike): string {
  return (
    safeString(item.creator_name) ||
    safeString(item.creator) ||
    safeString(item.channel_name) ||
    safeString(item.artist_name) ||
    safeString(item.team_name) ||
    '운영팀'
  )
}

function getPlatform(item: MarketDetailLike, fallback = 'HANBANG'): string {
  return safeString(item.platform_name) || safeString(item.platform) || fallback
}

function getPriceLabel(item: MarketDetailLike): string {
  const direct =
    safeNumber(item.latest_price) ??
    safeNumber(item.last_price) ??
    safeNumber(item.share_price_krw)

  if (direct !== null) return formatCurrencyKRW(direct)

  const usd = safeNumber(item.share_price_usd)
  if (usd !== null) return formatCurrencyKRW(Math.round(usd * 1350))

  return '가격 형성 중'
}

export function normalizeCategory(value: unknown): DetailCategory {
  const raw = safeString(value).toLowerCase()

  if (!raw) return 'default'

  if (
    raw.includes('youtube') ||
    raw.includes('channel') ||
    raw.includes('creator') ||
    raw.includes('유튜브') ||
    raw.includes('채널')
  ) {
    return 'youtube'
  }

  if (
    raw.includes('webtoon') ||
    raw.includes('comic') ||
    raw.includes('만화') ||
    raw.includes('웹툰')
  ) {
    return 'webtoon'
  }

  if (
    raw.includes('webnovel') ||
    raw.includes('novel') ||
    raw.includes('story') ||
    raw.includes('웹소설') ||
    raw.includes('소설')
  ) {
    return 'webnovel'
  }

  if (
    raw.includes('music') ||
    raw.includes('artist') ||
    raw.includes('album') ||
    raw.includes('song') ||
    raw.includes('공연') ||
    raw.includes('음악') ||
    raw.includes('뮤직')
  ) {
    return 'music'
  }

  if (
    raw.includes('sports') ||
    raw.includes('sport') ||
    raw.includes('team') ||
    raw.includes('athlete') ||
    raw.includes('esports') ||
    raw.includes('경기') ||
    raw.includes('스포츠')
  ) {
    return 'sports'
  }

  return 'default'
}

function buildCommonRecentPerformance(item: MarketDetailLike): string[] {
  const title = getTitle(item)
  const creator = getCreator(item)
  const price = getPriceLabel(item)
  const volume = formatNumber(item.volume, '거래량 집계 중')

  return [
    `${title}의 현재 기준 거래 참고 가격은 ${price} 수준으로 반영되고 있습니다.`,
    `최근 시장 참여 흐름은 ${volume} 단위 기준으로 누적 집계되고 있으며, 세부 체결 흐름은 상단 거래 영역에서 이어서 확인할 수 있습니다.`,
    `${creator} 관련 성과 지표와 시장 반응은 상품 스토리와 함께 종합적으로 해석하는 것이 적절합니다.`,
  ]
}

function buildCommonRoadmap(item: MarketDetailLike): string[] {
  const creator = getCreator(item)
  return [
    `${creator} 기준 핵심 콘텐츠 라인업 보강`,
    `팬 유입과 재방문을 높이는 리텐션 장치 확장`,
    `수익화 채널 다변화 및 외부 협업 가능성 확보`,
  ]
}

function buildDefaultTemplate(item: MarketDetailLike): DetailTemplate {
  const title = getTitle(item)
  const creator = getCreator(item)
  const price = getPriceLabel(item)

  return {
    category: 'default',
    categoryLabel: 'IP 자산',
    oneLiner: `${title}는 ${creator} 중심의 성장형 IP 자산으로, 시장 거래 흐름과 콘텐츠 확장 가능성을 함께 보는 구조입니다.`,
    spotlightTitle: '핵심 요약',
    spotlightItems: [
      { label: '운영 주체', value: creator },
      { label: '기준 가격', value: price },
      { label: '플랫폼', value: getPlatform(item) },
      { label: '타깃층', value: safeString(item.target_audience) || '확장형 대중 타깃' },
    ],
    investmentPoints: [
      '콘텐츠 확장과 거래 수요가 동시에 붙을 경우 밸류업 여지가 있습니다.',
      '팬 반응, 업데이트, 외부 노출 같은 이벤트가 가격 재평가의 계기가 될 수 있습니다.',
      '단순 보유형이 아니라 스토리와 성장성을 함께 보는 자산 구조입니다.',
    ],
    riskPoints: [
      '콘텐츠 성과가 일시적으로 둔화되면 거래 심리도 함께 약해질 수 있습니다.',
      '수익화 채널이 제한적이면 중장기 확장 속도가 느려질 수 있습니다.',
      '운영 주체의 실행력과 일정 관리가 성과에 직접 영향을 줄 수 있습니다.',
    ],
    revenueTitle: '기본 수익 구조',
    revenueDescription:
      safeString(item.revenue_model) ||
      '광고, 판매, 제휴, 라이선싱, 팬 기반 부가수익 등 복합 구조로 확장 가능한 자산으로 해석합니다.',
    recentPerformance: buildCommonRecentPerformance(item),
    roadmap: buildCommonRoadmap(item),
  }
}

function buildYoutubeTemplate(item: MarketDetailLike): DetailTemplate {
  const title = getTitle(item)
  const creator = getCreator(item)
  const subscribers = formatNumber(item.subscriber_count, '집계 중')
  const views =
    formatNumber(item.monthly_view_count, '') !== ''
      ? formatNumber(item.monthly_view_count)
      : formatNumber(item.view_count, '집계 중')
  const uploadFrequency = safeString(item.upload_frequency) || safeString(item.schedule) || '주기 정리 중'

  return {
    category: 'youtube',
    categoryLabel: '유튜브 채널',
    oneLiner: `${title}는 ${creator}가 운영하는 영상형 IP로, 조회수·팬 반응·업로드 지속성이 수익성과 재평가 포인트가 되는 구조입니다.`,
    spotlightTitle: '채널 핵심 지표',
    spotlightItems: [
      { label: '운영 채널', value: title },
      { label: '구독자', value: subscribers },
      { label: '조회수', value: views },
      { label: '업로드 주기', value: uploadFrequency },
    ],
    investmentPoints: [
      '콘텐츠 포맷이 명확하면 재생산성과 시리즈화 가능성이 높습니다.',
      '광고, 협찬, 멤버십, 커머스 연동 등 수익화 채널이 다층적으로 열릴 수 있습니다.',
      '팬 충성도가 높을수록 신규 포맷 전환과 외부 브랜드 협업이 유리합니다.',
    ],
    riskPoints: [
      '플랫폼 알고리즘 변화나 추천 노출 감소가 성과를 흔들 수 있습니다.',
      '업로드 주기 불안정은 조회수와 팬 리텐션 저하로 이어질 수 있습니다.',
      '특정 포맷 의존도가 높으면 장기적인 성장 탄력성이 떨어질 수 있습니다.',
    ],
    revenueTitle: '유튜브형 수익 구조',
    revenueDescription:
      safeString(item.revenue_model) ||
      '광고 수익, 협찬, PPL, 멤버십, 라이브 커머스, 외부 브랜드 제휴가 핵심 축이 되며 팬덤이 커질수록 수익 구조가 다변화됩니다.',
    recentPerformance: [
      `${title}는 구독자 ${subscribers}, 조회수 ${views} 수준을 기반으로 시장 관심도를 형성하고 있습니다.`,
      `업로드 주기 ${uploadFrequency}가 유지될수록 팬 재방문과 광고 효율에 긍정적으로 작용할 수 있습니다.`,
      `${creator} 중심의 채널 브랜딩이 강할수록 협찬·멤버십 전환 여지가 커집니다.`,
    ],
    roadmap: [
      '대표 포맷 강화 및 연속 시리즈 확장',
      '브랜드 협찬·PPL·멤버십 구조 고도화',
      '쇼츠·라이브·커뮤니티를 통한 팬 접점 다변화',
    ],
  }
}

function buildWebtoonTemplate(item: MarketDetailLike): DetailTemplate {
  const title = getTitle(item)
  const creator = getCreator(item)
  const platform = getPlatform(item, '연재 플랫폼')
  const episodeCount = formatNumber(item.episode_count, '집계 중')

  return {
    category: 'webtoon',
    categoryLabel: '웹툰 IP',
    oneLiner: `${title}는 ${creator} 중심의 서사형 IP로, 연재 지속성·유료 전환율·2차 창작 및 영상화 가능성이 핵심 가치입니다.`,
    spotlightTitle: '작품 핵심 지표',
    spotlightItems: [
      { label: '작품명', value: title },
      { label: '연재 플랫폼', value: platform },
      { label: '회차 수', value: episodeCount },
      { label: '주독자층', value: safeString(item.target_audience) || '장르 팬덤 중심' },
    ],
    investmentPoints: [
      '장르 몰입도가 높으면 장기 연재와 유료 전환 안정성이 좋아집니다.',
      '굿즈, 영상화, 출판, 해외 판권 등 2차 IP 확장 가능성이 큽니다.',
      '시즌 구조가 정교하면 이벤트성 거래 수요와 관심 환기가 쉽습니다.',
    ],
    riskPoints: [
      '연재 속도 저하나 작화·서사 품질 변동은 이탈로 이어질 수 있습니다.',
      '플랫폼 의존도가 높으면 외부 확장 속도가 제한될 수 있습니다.',
      '작품의 화제성이 특정 구간에 집중되면 변동성이 커질 수 있습니다.',
    ],
    revenueTitle: '웹툰형 수익 구조',
    revenueDescription:
      safeString(item.revenue_model) ||
      '유료 회차 전환, 시즌 판매, 굿즈, 단행본, 해외 판권, 영상화·게임화 같은 2차 사업 전개가 핵심 수익 축입니다.',
    recentPerformance: [
      `${title}는 ${platform} 기반 회차 ${episodeCount} 수준으로 축적되며, 장기 연재형 IP 해석이 가능합니다.`,
      `서사 누적과 팬덤 형성이 맞물리면 유료 전환과 외부 IP 제안이 함께 늘어날 수 있습니다.`,
      `${creator}의 연재 안정성과 세계관 확장력이 향후 가치 판단의 중요한 기준이 됩니다.`,
    ],
    roadmap: [
      '시즌별 핵심 에피소드 강화 및 팬덤 고착화',
      '굿즈·출판·해외 유통 등 2차 IP 확장 추진',
      '영상화 또는 콜라보 제안 대응 가능한 자산 구조 정비',
    ],
  }
}

function buildWebnovelTemplate(item: MarketDetailLike): DetailTemplate {
  const title = getTitle(item)
  const creator = getCreator(item)
  const platform = getPlatform(item, '연재 플랫폼')
  const episodeCount =
    formatNumber(item.episode_count, '') !== ''
      ? formatNumber(item.episode_count)
      : formatNumber(item.release_count, '집계 중')

  return {
    category: 'webnovel',
    categoryLabel: '웹소설 IP',
    oneLiner: `${title}는 ${creator}가 구축한 텍스트 기반 세계관 자산으로, 독자 락인과 시즌 누적, 2차 콘텐츠 확장이 핵심 가치입니다.`,
    spotlightTitle: '소설 핵심 지표',
    spotlightItems: [
      { label: '작품명', value: title },
      { label: '연재 플랫폼', value: platform },
      { label: '회차 수', value: episodeCount },
      { label: '팬 특성', value: safeString(item.fandom) || '정주행형 독자층' },
    ],
    investmentPoints: [
      '텍스트 기반 서사는 시즌 누적과 외전 확장에 유리합니다.',
      '웹툰화·드라마화·오디오북화 등 확장 경로가 비교적 다양합니다.',
      '충성 독자층이 형성되면 안정적인 장기 소비 구조를 기대할 수 있습니다.',
    ],
    riskPoints: [
      '연재 템포가 흔들리면 독자 이탈이 빠르게 발생할 수 있습니다.',
      '장르 경쟁이 치열하면 신규 유입 비용이 커질 수 있습니다.',
      '초기 화제성이 약하면 외부 판권 확장까지 시간이 오래 걸릴 수 있습니다.',
    ],
    revenueTitle: '웹소설형 수익 구조',
    revenueDescription:
      safeString(item.revenue_model) ||
      '유료 회차 결제, 시즌 패키지, 외전 판매, 오디오북, 웹툰화·영상화 판권, 굿즈 확장이 핵심 수익 구조입니다.',
    recentPerformance: [
      `${title}는 ${platform} 기반 누적 회차 ${episodeCount} 수준으로 서사 자산을 쌓고 있습니다.`,
      `독자 락인과 완독률이 높을수록 유료 전환과 외전 판매 효율이 개선될 수 있습니다.`,
      `${creator}의 필력과 연재 안정성은 장기 가치 형성의 핵심 변수입니다.`,
    ],
    roadmap: [
      '핵심 시즌 완성도 고도화 및 완독률 강화',
      '외전·특별편·패키지 판매 구조 확장',
      '웹툰화·오디오북·영상화 가능성 대응 준비',
    ],
  }
}

function buildMusicTemplate(item: MarketDetailLike): DetailTemplate {
  const title = getTitle(item)
  const creator = getCreator(item)
  const fandom = safeString(item.fandom) || '팬덤 확장형'
  const schedule = safeString(item.schedule) || '컴백·공연 일정 조율 중'

  return {
    category: 'music',
    categoryLabel: '음악/공연 IP',
    oneLiner: `${title}는 ${creator} 중심의 음악·공연형 IP로, 팬덤 밀도와 컴백·공연 이벤트가 가치 재평가를 이끄는 구조입니다.`,
    spotlightTitle: '아티스트 핵심 지표',
    spotlightItems: [
      { label: '프로젝트', value: title },
      { label: '주체', value: creator },
      { label: '팬덤 성격', value: fandom },
      { label: '예정 일정', value: schedule },
    ],
    investmentPoints: [
      '컴백, 공연, 콜라보 같은 이벤트성 모멘텀이 강하게 작용할 수 있습니다.',
      '스트리밍, 공연, 굿즈, 팬미팅, 브랜드 협업으로 수익층이 다변화됩니다.',
      '팬덤 충성도가 높을수록 굿즈·현장 소비·재구매율이 안정적으로 형성됩니다.',
    ],
    riskPoints: [
      '컴백 공백이 길어지면 관심도와 거래 심리가 약해질 수 있습니다.',
      '이벤트 의존도가 높으면 일정 지연 시 변동성이 커질 수 있습니다.',
      '팬덤 확장이 정체되면 신규 수익 채널 확대 속도가 느려질 수 있습니다.',
    ],
    revenueTitle: '음악/공연형 수익 구조',
    revenueDescription:
      safeString(item.revenue_model) ||
      '스트리밍, 음원 판매, 공연 수익, 팬미팅, 굿즈, 콜라보, 스폰서십이 유기적으로 연결되는 구조입니다.',
    recentPerformance: [
      `${title}는 팬덤 ${fandom} 성향을 바탕으로 이벤트 발생 시 거래 관심이 빠르게 반응할 수 있는 구조입니다.`,
      `${schedule} 같은 일정 이슈는 단기 모멘텀과 체결 활성화에 영향을 줄 수 있습니다.`,
      `${creator}의 브랜딩 강도와 현장 동원력은 장기 가치 형성에 중요한 변수입니다.`,
    ],
    roadmap: [
      '컴백·공연·팬 접점 확대를 통한 모멘텀 강화',
      '굿즈·현장 판매·콜라보 구조 확대',
      '팬덤 데이터 기반 리텐션 및 재구매 흐름 강화',
    ],
  }
}

function buildSportsTemplate(item: MarketDetailLike): DetailTemplate {
  const title = getTitle(item)
  const creator = getCreator(item)
  const fandom = safeString(item.fandom) || '이벤트 반응형 팬층'
  const schedule = safeString(item.schedule) || '시즌 일정 연동형'

  return {
    category: 'sports',
    categoryLabel: '스포츠/엔터 IP',
    oneLiner: `${title}는 ${creator} 중심의 시즌·이벤트 반응형 IP로, 경기·출연·화제성 이슈가 가치 변동의 핵심 동인입니다.`,
    spotlightTitle: '시즌 핵심 지표',
    spotlightItems: [
      { label: '프로젝트', value: title },
      { label: '주체', value: creator },
      { label: '팬 반응', value: fandom },
      { label: '시즌 일정', value: schedule },
    ],
    investmentPoints: [
      '경기 일정, 출연, 성적, 화제성 같은 이벤트가 즉각적인 관심도를 만들 수 있습니다.',
      '스폰서십, 중계, 굿즈, 오프라인 이벤트 등 수익 연결 포인트가 다양합니다.',
      '시즌 이슈가 강할수록 단기 거래와 장기 팬 확보가 동시에 일어날 수 있습니다.',
    ],
    riskPoints: [
      '성적, 출연 일정, 외부 이슈에 따라 변동성이 크게 확대될 수 있습니다.',
      '이벤트 공백기가 길면 체감 가치가 빠르게 약해질 수 있습니다.',
      '팬덤이 순간 이슈에만 반응하면 지속적인 수익화 구조가 약해질 수 있습니다.',
    ],
    revenueTitle: '스포츠/엔터형 수익 구조',
    revenueDescription:
      safeString(item.revenue_model) ||
      '스폰서십, 광고, 중계 노출, 굿즈, 현장 이벤트, 팬덤 기반 커머스가 핵심 수익 축으로 작동합니다.',
    recentPerformance: [
      `${title}는 ${schedule} 흐름에 따라 관심과 거래량이 반응하는 이벤트성 자산으로 해석할 수 있습니다.`,
      `${creator} 관련 화제성과 시즌 이슈는 단기 트래픽과 체결 흐름을 자극할 수 있습니다.`,
      `팬 반응 ${fandom}의 질과 지속성이 장기 가치 판단의 핵심 기준입니다.`,
    ],
    roadmap: [
      '시즌·이벤트 연계 노출 극대화',
      '스폰서·굿즈·중계형 수익 채널 정비',
      '팬 접점 확대 및 일정 연동형 프로모션 강화',
    ],
  }
}

export function buildDetailTemplate(item: MarketDetailLike): DetailTemplate {
  const category = normalizeCategory(item.category || item.content_type)

  switch (category) {
    case 'youtube':
      return buildYoutubeTemplate(item)
    case 'webtoon':
      return buildWebtoonTemplate(item)
    case 'webnovel':
      return buildWebnovelTemplate(item)
    case 'music':
      return buildMusicTemplate(item)
    case 'sports':
      return buildSportsTemplate(item)
    default:
      return buildDefaultTemplate(item)
  }
}
