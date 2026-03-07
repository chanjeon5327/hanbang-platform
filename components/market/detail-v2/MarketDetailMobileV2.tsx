import type { MarketDetailLike } from '@/lib/market/detailTemplates'
import HeroSummary from '@/components/market/detail-v2/HeroSummary'
import InvestmentCasePanel from '@/components/market/detail-v2/InvestmentCasePanel'
import PriceSnapshotPanel from '@/components/market/detail-v2/PriceSnapshotPanel'
import CreatorPlanPanel from '@/components/market/detail-v2/CreatorPlanPanel'

type Props = {
  item: MarketDetailLike | null
}

export default function MarketDetailMobileV2({ item }: Props) {
  return (
    <div className="space-y-0">
      <HeroSummary item={item} />
      <InvestmentCasePanel item={item} />
      <PriceSnapshotPanel item={item} />
      <CreatorPlanPanel item={item} />
    </div>
  )
}
