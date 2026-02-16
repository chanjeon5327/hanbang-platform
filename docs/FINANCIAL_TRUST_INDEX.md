# 금융 신뢰 지수 자체 평가 (10점 만점)

## 홈 (8.5/10)
- **강점**: 공식 스폰서 픽 배지, 카드 hover opacity 전환, shadow-sm 적용, active:scale→opacity 치환.
- **보완**: 비로그인 시 자산 요약 빈 카드. 스폰서 픽 외 레일에 원장검증·배당진행중 배지 API 연동 시 노출.
- **남은 0.2점 후보**: ① 비로그인 홈 자산 카드 placeholder ② 레일 카드 원장/정산 배지 API ③ Hero drop-shadow 제거 ④ CTA tap 피드백 opacity 통일 ⑤ 스폰서 픽 caption 톤 정리

## 마켓 (8.5/10)
- **강점**: 원장검증·정산완료 N건·배당진행중 배지(caption, border, rounded-full), 카드 hover 시 배지 opacity 강조.
- **보완**: 마켓 리스트 API(product_type, integrity_ok) 연동. D-day 배지와 신뢰 배지 우선순위 정리.
- **남은 0.2점 후보**: ① 배지 1개만 노출 시 우선순위 ② API 미연동 시 placeholder ③ 카드 내 MetricRow 정렬 ④ 빈 호가/체결 empty state ⑤ 정렬 옵션 토스형 정리

## 상세 (9.0/10)
- **강점**: SummaryFinancialCard "원장 기록 기반"(Check)·"실시간 체결 데이터"(녹색 dot 1.5s pulse)·"정산 이력 공개" 링크. 거래 탭 "실시간 시장 데이터" 배지(border, rounded-full). 투자 CTA 위 "투자 후 매월 배당 · 원장 자동 기록". disabled 시 "지연 가능" caption.
- **보완**: 정산 이력 /trust 고정. 상품별 정산 페이지 있으면 링크 개선.
- **남은 0.2점 후보**: ① 상품별 정산 이력 링크 ② 누적 배당 지급액 API 연동 ③ 정보탭 핵심 숫자 카드 ④ CTA animate-pulse D-day만 유지 ⑤ 거래 탭 sticky top 검증

---

**종합**: 금융 신뢰 레이어(원장·실시간·정산 공개)가 홈/마켓/상세에 적용. hover:scale·active:scale→opacity, shadow-lg→shadow-sm 치환 완료. dot pulse(1.5s)만 유지.
