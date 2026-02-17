# 금융 신뢰 지수 자체 평가 (10점 만점)

## 정보 계층 압축 적용 (2026-02-17)

### 숫자 설득 1→2→3 구조
- **상세**: 현재가(metric-xl) > 예상수익률(80%) > 모집률(MetricRow) > 참여·오늘(muted). **PASS**
- **마켓**: 현재가(metric-lg) > 수익률(body) > 모집률. 배지 opacity 0.75. **PASS**
- **거래**: 예상 체결가/수수료/체결가능 MetricRow 3열. 호가 가격 굵게·수량 얇게. 배경 강조 제거. **PASS**

---

## 홈 (8.5/10)
- **강점**: 공식 스폰서 픽, opacity 전환, shadow-sm.
- **보완**: 비로그인 자산 빈 카드, 레일 배지 API.
- **남은 0.2점 후보**: ① 비로그인 placeholder ② 레일 배지 API ③ CTA 피드백 통일

## 마켓 (9.0/10)
- **강점**: 숫자 위계(metric-lg > body > 모집률), 배지 caption opacity 0.75.
- **보완**: API 연동, 배지 우선순위.
- **남은 0.2점 후보**: ① 배지 1개 우선순위 ② MetricRow 정렬 ③ 빈 호가 empty state

## 상세 (9.2/10)
- **강점**: 현재가 압도 → 수익률 80% → 모집률 MetricRow. 참여·오늘 muted.
- **보완**: 정산 링크 /trust 고정.
- **남은 0.2점 후보**: ① 상품별 정산 링크 ② 누적 배당 API ③ 정보탭 숫자 카드

## 거래 (9.0/10)
- **강점**: 예상 체결가/수수료/체결가능 MetricRow. 호가 가격 굵게·수량 caption. 설명문 압축.
- **보완**: 수수료 API 연동.
- **남은 0.2점 후보**: ① 수수료 표시 ② 체결가능 실시간 ③ lockBusy 안내 1줄

---

**종합**: 숫자 계층 1-2-3 구조 완성. 금융 설득 밀도 9.0/10.

---

## 숫자 지배력 20% 상승 (2026-02-17)

### 시각적 힘 조정
- **상세**: 현재가 margin-top·letter-spacing·line-height 강화. 예상수익률 opacity 0.75. 모집률 caption. progress 4px.
- **마켓**: 현재가 상단 20px. 배지 0.7rem. progress 4px.
- **거래**: MetricRow compact(gap 12px, label opacity 0.6). OrderBook 행간 2px, 구분선 opacity 0.4.
- **여백**: Section 간격 var(--space-lg) 24px 통일.

### 점수
| 항목 | 점수 |
|------|------|
| 시각 지배력 | 9.2/10 |
| 금융 설득 밀도 | 9.2/10 |
| 종합 | 9.2/10 |

---

## 숫자 공간 지배력 (2026-02-17)

### 3구역 재비율
- **ZONE A**: 현재가 padding 28/16px, Divider로 분리
- **ZONE B**: 예상수익률 단독 행, 모집률 MetricRow, progress bar
- **ZONE C**: 참여/오늘 + extraMetrics MetricRow compact

### 마켓 카드
- 현재가 위 24px, 썸네일 aspect 2/1, progress bar 하단 이동
- 배지 0.65rem

### 거래 탭
- OrderBook 가격 60% / 수량 40%, 숫자 오른쪽 정렬
- MetricRow 2열 (예상체결가·수수료 | 체결가능)
- 예수금 라인 제거

### 점수
| 항목 | 점수 |
|------|------|
| 시각 지배력 | 9.5/10 |
| 설득 밀도 | 9.5/10 |
| 종합 | 9.5/10 |
| 9.8 도달 | 보완 후보: 수수료 API, 체결가능 실시간 |

---

## 금융 리서치 리포트 스타일 (2026-02-17)

### 추가 블록
- **Performance Snapshot**: SummaryFinancialCard 하단, 3열 (30일/90일 수익률, 변동성)
- **Risk Snapshot**: 정보 탭 최상단, 3열 (MDD, 평균 회수 기간, 누적 배당 지급률)
- **24H 거래대금/체결 수**: PriceHeader 하단 MetricRow 2열
- **예상 체결 요약**: TradingPanelV2 상단 (예상 체결가, 예상 수수료)

### 검증
- text-[숫자px]: 0개
- hover:scale: 0개 (market 영역)
- shadow-lg: 0개 (market 영역)
- build: 성공

### 점수
| 항목 | 점수 |
|------|------|
| 시각 지배력 | 9.6/10 |
| 금융 설득 밀도 | 9.6/10 |
| 종합 | 9.6/10 |
| 10점까지 보정 후보 | ① 수수료 API 연동 ② Performance/Risk 데이터 API ③ 체결가능 실시간 |

---

## 리서치 리포트 스타일 안정화 (2026-02-17)

### 시각적 미세 조정
- **SummaryFinancialCard**: letter-spacing -0.02em, line-height 1.03, margin-top 4px, 수익률 opacity 0.7
- **MetricRow**: label opacity 0.6 전역, value opacity 1
- **CardV5**: padding 22/20px, border opacity 0.7, shadow 0.04
- **OrderBookRealtime**: 행간 3px, Divider opacity 0.35, 수량 font-normal
- **TradingPanelV2**: 설명문 제거, 입력 border 0.7, placeholder 0.4
- **CardV5MarketCard**: 썸네일 brightness 0.9, title/현재가 margin 6px, 배지 opacity 0.65 (hover 0.9)
- **SponsoredPickHeroV5**: 현재가+예상수익률 2열, CTA 아래 "배당 기반 수익 구조"

### 검증
- text-[숫자px]: 0
- hover:scale: 0
- drop-shadow: 0
- shadow-lg: 0 (market 영역)
- build: 성공

### 점수
| 항목 | 점수 |
|------|------|
| 시각 지배력 | 9.7/10 |
| 금융 설득 밀도 | 9.7/10 |
| 종합 | 9.7/10 |
| 10점 도달 | 미도달 |
| 남은 0.1점 보정 후보 | ① 수수료 실데이터 ② Performance/Risk API |
