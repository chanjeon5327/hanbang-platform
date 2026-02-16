# 토스증권 레이아웃 비교 요약 (스크린샷 기준)

## 홈 화면
1. **상단 히어로**: 토스증권은 "오늘의 추천" 등 1개 카드로 고정. 한빙은 SponsoredPickHeroV5로 동일한 1개 고정 카드 구조.
2. **섹션 간격**: 토스증권은 24px 전후의 일관된 여백. 한빙은 `var(--space-lg)` 24px로 통일.
3. **카드 radius**: 토스증권 20px 전후. 한빙 `var(--radius-lg)` 20px 적용.
4. **타이포 밀도**: h1 leading-tight, h2/h3 leading-snug, body leading-normal, caption leading-none으로 금융 앱 수준 정리.
5. **숫자 정렬**: tabular-nums 전역 적용으로 가격·수익률·모집률 등 수치가 세로로 정렬됨.

## 상세 화면
6. **탭 구조**: 토스증권은 정보/거래/투자 탭으로 분리. 한빙도 동일한 3탭(정보·거래·투자) 구조.
7. **요약 카드**: 상단 SummaryFinancialCard로 현재가·예상수익률·모집률을 한 장에 요약. 토스증권 주식 상세의 "요약" 영역과 유사.
8. **카드 내부**: border 중복 제거, subtle-divider로만 구분. 24px는 카드 간, 12~16px는 카드 내부 섹션 간격.
9. **디버그 아웃라인**: `DEBUG_SECTIONS=true` 시 각 섹션에 1px outline으로 정렬 검증 가능. 확인 후 `false`로 변경.

## 거래 화면
10. **ExchangeSection**: PriceHeader·Chart·OrderBook·TradingPanel 수직 정렬, 2열 grid gap 24px 고정. sticky top 104px로 상단바·탭에 가리지 않게 배치. 호가/체결 행에 metric-number 적용.
