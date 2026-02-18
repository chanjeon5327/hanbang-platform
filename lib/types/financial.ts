/**
 * ============================================================================
 * HANBANG Financial Engine V1 — 금융 엔진 타입 정의
 * ============================================================================
 *
 * [금융감독원 전자금융업 심사 기준]
 * - 원장(Ledger)의 불변성 해시 체인 구조
 * - 포지션·손익 정합성 타입
 * - 리스크 지표(MDD, Rolling Return) 타입
 * - 정산 스냅샷 동결 타입
 * - 관리자 포렌식 감사 타입
 *
 * 본 파일은 금융위원회/금융감독원의 전자금융업 감독규정에 따라
 * 거래 데이터의 무결성·추적가능성·감사가능성을 확보하기 위한
 * 타입 시스템을 정의합니다.
 * ============================================================================
 */

/* ─────────────────────────────────────────────
 * 1. LEDGER HASH CHAIN — 원장 불변 해시 체인
 * ───────────────────────────────────────────── */

/** 원장 엔트리 허용 유형 (금감원 보고용 분류 기준) */
export type LedgerEntryType =
  | 'CASH_DEBIT'        // 현금 출금 (투자금 차감)
  | 'CASH_CREDIT'       // 현금 입금 (배당금·환불)
  | 'ASSET_CREDIT'      // 자산 취득 (수익권 매수)
  | 'ASSET_DEBIT'       // 자산 처분 (수익권 매도)
  | 'DIVIDEND'          // 배당금 지급
  | 'PRODUCT_PURCHASE'  // 상품 구매
  | 'PRODUCT_SELL'      // 상품 매도
  | 'TRADE_BUY'         // 거래소 매수
  | 'TRADE_SELL'        // 거래소 매도
  | 'SIM_DEPOSIT'       // 시뮬레이션 입금
  | 'SIM_RESET'         // 시뮬레이션 초기화
  | 'SETTLEMENT_SEAL';  // 정산 봉인

/** 해시 체인이 적용된 원장 엔트리 */
export interface LedgerEntrySealed {
  id: string;
  user_id: string;
  order_id: string | null;
  entry_type: LedgerEntryType;
  currency: string;
  amount: number;
  asset_id: string | null;
  quantity: number;
  memo: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  ledger_posted_at: string | null;
  /** 이전 엔트리의 row_hash (체인 연결) */
  prev_hash: string;
  /** 현재 행의 SHA-256 해시 (prev_hash + 행 데이터 기반) */
  row_hash: string;
  /** 해시 봉인 시각 */
  sealed_at: string;
  /** 전역 순서 번호 (체인 정렬 기준) */
  seq: number;
}

/** 원장 무결성 검증 결과 (rpc_verify_ledger_integrity 반환) */
export interface LedgerIntegrityResult {
  /** 검증한 총 엔트리 수 */
  total_entries: number;
  /** 해시 불일치 건수 */
  mismatches: number;
  /** 첫 번째 불일치 엔트리 ID */
  first_mismatch_id: string | null;
  /** 체인 연결 오류 건수 (prev_hash 불일치) */
  chain_breaks: number;
  /** 무결성 통과 여부 */
  integrity_ok: boolean;
  /** 검증 소요 시간 (ms) */
  verified_at: string;
}

/* ─────────────────────────────────────────────
 * 2. POSITIONS & PnL — 포지션·손익 관리
 * ───────────────────────────────────────────── */

/** 사용자 포지션 (매수 평균가 기반 관리) */
export interface Position {
  id: string;
  user_id: string;
  asset_id: string;
  /** 보유 수량 */
  quantity: number;
  /** 평균 매수 단가 (KRW) */
  avg_price: number;
  /** 총 취득 원가 (KRW) */
  total_cost: number;
  /** 누적 실현 손익 (KRW) */
  realized_pnl: number;
  updated_at: string;
}

/** PnL API 응답 (/api/dashboard/pnl) */
export interface PnlResponse {
  /** 현금 잔고 (KRW) */
  cash_balance: number;
  /** 포지션 목록 (미실현 손익 포함) */
  positions: PnlPositionItem[];
  /** 총 미실현 손익 합계 */
  total_unrealized_pnl: number;
  /** 총 실현 손익 합계 */
  total_realized_pnl: number;
  /** 총 포트폴리오 가치 (현금 + 자산 시가) */
  total_portfolio_value: number;
}

/** 개별 포지션 PnL 정보 */
export interface PnlPositionItem {
  asset_id: string;
  title: string;
  quantity: number;
  /** 평균 매수가 (KRW) */
  avg_price: number;
  /** 현재가 (KRW) */
  current_price: number;
  /** 미실현 손익 = (current_price - avg_price) × quantity */
  unrealized_pnl: number;
  /** 미실현 수익률 (%) */
  unrealized_rate: number;
  /** 실현 손익 (KRW) */
  realized_pnl: number;
}

/* ─────────────────────────────────────────────
 * 3. RISK ENGINE — 리스크 지표
 * ───────────────────────────────────────────── */

/** 일별 포트폴리오 스냅샷 */
export interface PortfolioDailySnapshot {
  id: string;
  user_id: string;
  /** 스냅샷 날짜 (YYYY-MM-DD) */
  snapshot_date: string;
  /** 당일 총 자산 가치 (현금 + 자산 시가) */
  equity: number;
  /** 당일 현금 잔고 */
  cash_balance: number;
  /** 당일 자산 시가 합계 */
  asset_value: number;
  created_at: string;
}

/** MDD (Maximum Drawdown) 분석 결과 */
export interface MddResult {
  user_id: string;
  /** 최대 낙폭 (%) — 음수: -15 = 15% 하락 */
  mdd_pct: number;
  /** 고점 일자 */
  peak_date: string;
  /** 저점 일자 */
  trough_date: string;
  /** 고점 자산가치 */
  peak_equity: number;
  /** 저점 자산가치 */
  trough_equity: number;
}

/** Rolling 수익률 */
export interface RollingReturn {
  user_id: string;
  /** 30일 수익률 (%) */
  return_30d: number | null;
  /** 90일 수익률 (%) */
  return_90d: number | null;
  /** 현재 총 자산 */
  current_equity: number;
}

/** Risk API 응답 (/api/dashboard/risk) */
export interface RiskResponse {
  mdd: MddResult | null;
  rolling_returns: RollingReturn;
  /** 최근 30일 일별 equity 추이 */
  equity_history: Array<{ date: string; equity: number }>;
}

/* ─────────────────────────────────────────────
 * 4. SETTLEMENT FREEZE — 정산 동결
 * ───────────────────────────────────────────── */

/** 정산 배치 (동결 해시 포함) */
export interface SettlementBatch {
  id: string;
  settlement_date: string;
  confirmed_at: string | null;
  /** 동결 시점 원장 스냅샷 해시 (모든 사용자의 마지막 row_hash 결합) */
  ledger_snapshot_hash: string | null;
  /** 동결 시점 원장 엔트리 총 수 */
  entry_count_at_seal: number | null;
  /** 정산 확정 시각 */
  finalized_at: string | null;
  /** 정산 확정 관리자 ID */
  finalized_by: string | null;
}

/** 정산 확정 API 요청 */
export interface SettlementFinalizeRequest {
  batch_id: string;
}

/** 정산 확정 API 응답 */
export interface SettlementFinalizeResponse {
  ok: boolean;
  batch_id: string;
  ledger_snapshot_hash: string;
  entry_count: number;
  finalized_at: string;
}

/* ─────────────────────────────────────────────
 * 5. SAFE ORDER — 안전 주문 시스템
 * ───────────────────────────────────────────── */

/** 안전 주문 배치 요청 */
export interface SafeOrderRequest {
  content_id?: string;
  product_id?: string;
  amount: number;
  idempotency_key?: string;
  payment_method?: 'pg' | 'wallet';
}

/** 안전 주문 RPC 결과 */
export interface SafeOrderResult {
  ok: boolean;
  order_id?: string;
  error?: string;
  filled_quantity?: number;
  remaining_quantity?: number;
  actual_amount?: number;
  idempotent?: boolean;
}

/* ─────────────────────────────────────────────
 * 6. ADMIN FORENSIC — 관리자 포렌식 감사
 * ───────────────────────────────────────────── */

/** 포렌식 대시보드 API 응답 */
export interface ForensicDashboardData {
  /** 원장 무결성 검사 결과 */
  ledger_integrity: LedgerIntegrityResult;
  /** 최근 24시간 로그인 시도 통계 */
  login_stats: LoginStats;
  /** 최근 강제 로그아웃 기록 */
  force_logouts: ForceLogoutRecord[];
  /** 시간별 로그인 실패율 (최근 24시간) */
  hourly_failure_rates: HourlyFailureRate[];
}

/** 로그인 통계 */
export interface LoginStats {
  total_attempts: number;
  success_count: number;
  failure_count: number;
  failure_rate: number;
  unique_users: number;
}

/** 강제 로그아웃 기록 */
export interface ForceLogoutRecord {
  user_id: string;
  email: string | null;
  nickname: string | null;
  force_logout_at: string;
}

/** 시간별 실패율 */
export interface HourlyFailureRate {
  hour: string;
  total: number;
  failures: number;
  rate: number;
}

/* ─────────────────────────────────────────────
 * 7. GLOBAL LEDGER SNAPSHOT — 글로벌 원장 스냅샷 (V1.5)
 * ───────────────────────────────────────────── */

/** 글로벌 원장 스냅샷 레코드 */
export interface GlobalLedgerSnapshot {
  id: string;
  snap_date: string;
  snapshot_hash: string;
  user_count: number;
  entry_count: number;
  created_at: string;
  created_by: string | null;
}

/** 글로벌 스냅샷 생성 RPC 결과 */
export interface GlobalSnapshotCreateResult {
  ok: boolean;
  id?: string;
  snap_date?: string;
  snapshot_hash?: string;
  user_count?: number;
  entry_count?: number;
}

/** 글로벌 스냅샷 검증 RPC 결과 */
export interface GlobalSnapshotVerifyResult {
  ok: boolean;
  error?: string;
  snapshot_id?: string;
  snap_date?: string;
  stored_hash?: string;
  recomputed_hash?: string;
  hash_match?: boolean;
  stored_entry_count?: number;
  current_entry_count?: number;
  entry_count_match?: boolean;
  verified_at?: string;
}

/* ─────────────────────────────────────────────
 * 8. REVENUE DISTRIBUTION — 수익분배 엔진 (V1.5)
 * ───────────────────────────────────────────── */

/** 수익 이벤트 상태 */
export type RevenueEventStatus = 'PENDING' | 'DISTRIBUTED' | 'CANCELLED';

/** 수익 이벤트 */
export interface RevenueEvent {
  id: string;
  content_id: string;
  gross_amount: number;
  net_amount: number;
  currency: string;
  occurred_at: string;
  status: RevenueEventStatus;
  created_at: string;
  created_by: string | null;
}

/** 수익 분배 내역 */
export interface RevenueDistribution {
  id: string;
  event_id: string;
  user_id: string;
  amount: number;
  quantity_held: number;
  share_ratio: number;
  ledger_entry_id: string | null;
  status: string;
  created_at: string;
}

/** 수익분배 RPC 결과 */
export interface RevenueDistributeResult {
  ok: boolean;
  error?: string;
  event_id?: string;
  total_distributed?: number;
  undistributed?: number;
  holder_count?: number;
}

/** 수익 이벤트 생성 요청 */
export interface RevenueEventCreateRequest {
  content_id: string;
  gross_amount: number;
  net_amount: number;
  occurred_at?: string;
}

/* ─────────────────────────────────────────────
 * 9. DIVIDEND DASHBOARD — 배당 대시보드 (V1.5)
 * ───────────────────────────────────────────── */

/** 배당 대시보드 API 응답 (/api/dashboard/dividends) */
export interface DividendDashboardResponse {
  /** 이번 달 배당 총액 */
  this_month: number;
  /** 누적 배당 총액 */
  total_cumulative: number;
  /** 최근 12개월 월별 배당 */
  monthly: Array<{ month: string; amount: number }>;
  /** 최근 분배 내역 (최대 10건) */
  recent_distributions: Array<{
    event_id: string;
    content_id: string;
    amount: number;
    share_ratio: number;
    created_at: string;
  }>;
}

/* ─────────────────────────────────────────────
 * 10. EXCHANGE V2 — 거래소 주문/체결/오더북
 * ───────────────────────────────────────────── */

export type OrderSide = 'BUY' | 'SELL';
export type ExchangeOrderType = 'LIMIT' | 'MARKET';
export type ExchangeOrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELED';

/** 거래소 주문 */
export interface ExchangeOrder {
  id: string;
  user_id: string;
  asset_id: string;
  side: OrderSide;
  order_type: ExchangeOrderType;
  price: number | null;
  quantity: number | null;
  amount_max: number | null;
  remaining_qty: number;
  remaining_amount: number;
  status: ExchangeOrderStatus;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

/** 공개 체결 정보 (사용자 ID 제외) */
export interface TradePublic {
  id: string;
  asset_id: string;
  price: number;
  quantity: number;
  taker_side: OrderSide;
  created_at: string;
}

/** 오더북 호가 레벨 */
export interface OrderBookLevel {
  price: number;
  qty: number;
  order_count: number;
}

/** 오더북 응답 */
export interface OrderBookResponse {
  asset_id: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

/** 거래소 주문 배치 요청 */
export interface ExchangePlaceRequest {
  asset_id: string;
  side: OrderSide;
  order_type: ExchangeOrderType;
  price?: number;
  quantity?: number;
  amount_max?: number;
  idempotency_key?: string;
}

/** 거래소 주문 배치 RPC 결과 */
export interface ExchangePlaceResult {
  ok: boolean;
  error?: string;
  order_id?: string;
  status?: ExchangeOrderStatus;
  idempotent?: boolean;
  match_result?: {
    fills: number;
    total_filled: number;
    total_value: number;
    avg_price: number;
  };
}

/* ─────────────────────────────────────────────
 * 11. CORPORATE ACTIONS — 배당주
 * ───────────────────────────────────────────── */

export type CorporateActionStatus = 'SCHEDULED' | 'SNAPSHOTTED' | 'PAID' | 'CANCELED';

/** 기업행위 (배당) */
export interface CorporateActionDividend {
  id: string;
  asset_id: string;
  action_type: 'DIVIDEND';
  ex_date: string;
  record_date: string;
  pay_date: string;
  amount_per_share: number;
  currency: string;
  status: CorporateActionStatus;
  created_at: string;
  created_by: string | null;
}

/** 배당 보유자 스냅샷 */
export interface DividendSnapshotRow {
  id: string;
  action_id: string;
  user_id: string;
  quantity: number;
  payout: number;
  paid: boolean;
  snapped_at: string;
}
