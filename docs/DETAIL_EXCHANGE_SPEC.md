# 상세페이지 거래소형 스펙 (DETAIL_EXCHANGE_SPEC)

## 1. 정체성

- **거래소형(Trade-first) + 월배당**
- 상품 타입 2종에 따라 상세 UI 분기
- USD 기축 저장 + 로컬통화 표시(환율 변환)

## 2. 상품 타입

| 타입 | 설명 | UI |
|------|------|-----|
| `DIVIDEND_ONLY` | 월배당만 | 투자/배당 패널, "거래 불가" 문구 |
| `DIVIDEND_TRADABLE` | 월배당+거래 | TradingPanel v2 (호가/주문/체결/내주문) |

## 3. DB 스키마 (content_items 추가 컬럼)

| 컬럼 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| product_type | text | DIVIDEND_ONLY | 상품 타입 |
| pricing_currency | text | USD | 기축 통화 |
| share_price_usd | numeric(20,6) | - | 주당 가격 (USD) |
| total_raise_usd | numeric(20,6) | - | 총 모집액 (USD) |
| current_raise_usd | numeric(20,6) | - | 현재 모집액 (USD) |
| dividend_monthly_usd_per_share | numeric(20,6) | - | 월 배당금 (USD/주) |
| dividend_monthly_rate | numeric(10,4) | - | 월 배당률 (%) |
| payout_day | smallint | 3 | 매월 정산일 (1~28) |

## 4. 정산 규칙

- **기준일**: 매월 말일 23:59:59 보유자 기준
- **정산일**: 매월 `payout_day`일 (기본 3일)
- 실제 수익은 콘텐츠 성과에 따라 변동

## 5. API

| 엔드포인트 | 설명 |
|------------|------|
| GET /api/market/item/[id] | 상세 조회, 신규 컬럼 + fx_rate 포함 |
| GET /api/fx/usd | USD→KRW 환율 (임시) |
| GET /api/market/orderbook/[id] | 호가창 (mock 허용) |
| GET /api/market/trades/[id] | 체결 내역 (mock 허용) |

## 6. UI 구조 (리듬형 섹션)

1. 영상/썸네일
2. 타이틀 + OFFICIAL IP EXCHANGE + 타입 배지 (월배당 / 월배당+거래)
3. PriceHeader (USD + 로컬)
4. PriceChartBlock (USD 기반, 로컬 변환)
5. TradingPanel v2 (DIVIDEND_TRADABLE) / 거래 불가 (DIVIDEND_ONLY)
6. DividendInfo (정산일, 월 배당률, ? 팝업)
7. ExpectedReturnBox (월 수익률 기준)
8. LiveMomentumBar / RecentInvestLog / ProductChat

## 7. Sticky CTA 분기

- DIVIDEND_ONLY: "₩XXX 투자하기"
- DIVIDEND_TRADABLE: "₩XXX 투자/매수"

## 8. orderbook_orders / trades (TODO)

- 스키마만 추가, 실체결 로직 TODO
- UI 단계에서 mock/dummy 허용
