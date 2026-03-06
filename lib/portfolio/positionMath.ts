/**
 * 포지션 계산 기준 단일화
 *
 * 정의:
 * - position_qty: 보유수량 (ASSET_CREDIT - ASSET_DEBIT, min 0)
 * - total_bought: 총 매수 수량 (cost 배분용)
 * - total_cost: 매수 주문의 CASH_DEBIT 합계
 * - cost_basis: 잔여 매입금액 = total_cost * (position_qty / total_bought)
 * - avg_price: 평균매수가 = total_cost / total_bought
 * - current_price: 현재가 (fallback 처리)
 * - market_value: 평가금액 = position_qty * current_price
 * - unrealized_pnl: 미실현손익 = market_value - cost_basis
 * - return_pct: 수익률 = (unrealized_pnl / cost_basis) * 100
 *
 * divide-by-zero 방지: cost_basis/total_bought가 0이면 0 반환
 * NaN/Infinity 방지: 모든 반환값은 유한수
 */

export type PositionCalcInput = {
  /** 보유 수량 (net) */
  position_qty: number;
  /** 총 매수 수량 (cost 배분용) */
  total_bought: number;
  /** 매수 원금 합계 (CASH_DEBIT) */
  total_cost: number;
  /** 현재가 (KRW) */
  current_price: number;
};

export type PositionCalcResult = {
  position_qty: number;
  avg_price: number;
  cost_basis: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  return_pct: number;
};

function safeNum(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return v;
}

/**
 * 단일 포지션 계산
 */
export function calcPosition(input: PositionCalcInput): PositionCalcResult {
  const qty = Math.max(0, safeNum(input.position_qty));
  const totalBought = Math.max(0, safeNum(input.total_bought));
  const totalCost = Math.max(0, safeNum(input.total_cost));
  const currentPrice = Math.max(0, safeNum(input.current_price));

  const costBasis =
    totalBought > 0 && qty > 0 ? totalCost * (qty / totalBought) : 0;
  const avgPrice = totalBought > 0 ? totalCost / totalBought : 0;
  const marketValue = qty * currentPrice;
  const unrealizedPnl = marketValue - costBasis;
  const returnPct =
    costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  return {
    position_qty: qty,
    avg_price: avgPrice,
    cost_basis: costBasis,
    current_price: currentPrice,
    market_value: marketValue,
    unrealized_pnl: unrealizedPnl,
    return_pct: returnPct,
  };
}

/**
 * 표시용 반올림 (내부 계산은 보존, UI 전달 시에만 사용)
 */
export function roundForDisplay(
  result: PositionCalcResult
): {
  avg_price: number;
  cost_basis: number;
  market_value: number;
  unrealized_pnl: number;
  return_pct: number;
} {
  return {
    avg_price: Math.round(result.avg_price),
    cost_basis: Math.round(result.cost_basis),
    market_value: Math.round(result.market_value),
    unrealized_pnl: Math.round(result.unrealized_pnl),
    return_pct: Math.round(result.return_pct * 100) / 100,
  };
}
