import { buildDetailTemplate, type MarketDetailLike } from '@/lib/market/detailTemplates'

export type DetailTone = {
  category: string
  chipClass: string
  cardClass: string
  softClass: string
  dotClass: string
  panelBadgeClass: string
  haloClass: string
  summaryTag: string
  marketHint: string
}

export function getDetailTone(item: MarketDetailLike | null | undefined): DetailTone {
  const template = buildDetailTemplate(item ?? {})

  switch (template.category) {
    case 'youtube':
      return {
        category: template.category,
        chipClass:
          'border-red-400/20 bg-red-400/10 text-red-200',
        cardClass:
          'bg-[radial-gradient(circle_at_top_left,rgba(248,113,113,0.18),transparent_28%),linear-gradient(135deg,#181119_0%,#10131b_48%,#07090d_100%)]',
        softClass:
          'border-red-400/20 bg-red-400/[0.08]',
        dotClass: 'bg-red-300',
        panelBadgeClass:
          'border-red-400/20 bg-red-400/10 text-red-200',
        haloClass: 'bg-red-400/16',
        summaryTag: '영상형 모멘텀',
        marketHint: '구독자·조회수·업로드 리듬을 함께 보는 자산입니다.',
      }
    case 'webtoon':
      return {
        category: template.category,
        chipClass:
          'border-pink-400/20 bg-pink-400/10 text-pink-200',
        cardClass:
          'bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.18),transparent_28%),linear-gradient(135deg,#1b1220_0%,#11131b_48%,#08090f_100%)]',
        softClass:
          'border-pink-400/20 bg-pink-400/[0.08]',
        dotClass: 'bg-pink-300',
        panelBadgeClass:
          'border-pink-400/20 bg-pink-400/10 text-pink-200',
        haloClass: 'bg-pink-400/16',
        summaryTag: '서사형 IP',
        marketHint: '회차 누적과 팬덤 확장을 함께 보는 자산입니다.',
      }
    case 'webnovel':
      return {
        category: template.category,
        chipClass:
          'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
        cardClass:
          'bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.18),transparent_28%),linear-gradient(135deg,#191120_0%,#11131b_48%,#08090f_100%)]',
        softClass:
          'border-fuchsia-400/20 bg-fuchsia-400/[0.08]',
        dotClass: 'bg-fuchsia-300',
        panelBadgeClass:
          'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200',
        haloClass: 'bg-fuchsia-400/16',
        summaryTag: '텍스트 세계관',
        marketHint: '독자 락인과 IP 확장 가능성을 함께 보는 자산입니다.',
      }
    case 'music':
      return {
        category: template.category,
        chipClass:
          'border-violet-400/20 bg-violet-400/10 text-violet-200',
        cardClass:
          'bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.18),transparent_28%),linear-gradient(135deg,#141321_0%,#10131b_48%,#07090d_100%)]',
        softClass:
          'border-violet-400/20 bg-violet-400/[0.08]',
        dotClass: 'bg-violet-300',
        panelBadgeClass:
          'border-violet-400/20 bg-violet-400/10 text-violet-200',
        haloClass: 'bg-violet-400/16',
        summaryTag: '이벤트형 팬덤',
        marketHint: '컴백·공연·팬덤 반응을 함께 보는 자산입니다.',
      }
    case 'sports':
      return {
        category: template.category,
        chipClass:
          'border-amber-400/20 bg-amber-400/10 text-amber-200',
        cardClass:
          'bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.18),transparent_28%),linear-gradient(135deg,#19160e_0%,#11131b_48%,#07090d_100%)]',
        softClass:
          'border-amber-400/20 bg-amber-400/[0.08]',
        dotClass: 'bg-amber-300',
        panelBadgeClass:
          'border-amber-400/20 bg-amber-400/10 text-amber-200',
        haloClass: 'bg-amber-400/16',
        summaryTag: '시즌·이벤트 반응',
        marketHint: '일정·이벤트·팬 반응을 함께 보는 자산입니다.',
      }
    default:
      return {
        category: template.category,
        chipClass:
          'border-sky-400/20 bg-sky-400/10 text-sky-200',
        cardClass:
          'bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_28%),linear-gradient(135deg,#111827_0%,#0f131b_48%,#07090d_100%)]',
        softClass:
          'border-sky-400/20 bg-sky-400/[0.08]',
        dotClass: 'bg-sky-300',
        panelBadgeClass:
          'border-sky-400/20 bg-sky-400/10 text-sky-200',
        haloClass: 'bg-sky-400/16',
        summaryTag: '성장형 IP 자산',
        marketHint: '가격과 서사를 함께 보는 성장형 자산입니다.',
      }
  }
}
