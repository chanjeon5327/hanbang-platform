# HANBANG 디자인 마스터 체크리스트

> 토스증권형 × 엔젤투자 × 배당 중심 × 로얄블루

## 브랜드 컨셉
- [x] 메인 컬러: Royal Blue (#1E3A8A)
- [x] 서브 컬러: Midnight Navy (#0F172A)
- [x] 액센트: Emerald (수익), Red (손실)
- [x] 톤: 토스증권형, 미니멀, 금융 신뢰감

## 1. 디자인 기반 시스템
- [x] globals.css 색상 토큰 (CSS variables)
- [x] 카드 그림자 시스템
- [x] 버튼 primary / secondary / ghost / danger
- [x] 숫자 전용 metric 클래스
- [x] shimmer skeleton
- [x] fade-in 애니메이션
- [x] active:scale-[0.98] tap-scale
- [x] lib/design/tokens.ts
- [x] lib/utils/format.ts (formatKrw, formatRate, formatQuantity, formatCompactNumber)

## 2. 홈 (엔젤 대시보드)
- [x] Hero: Royal Blue 그라데이션
- [x] 내 자산 요약 카드 (로얄블루)
- [x] 엔젤 Pick / 수익권 CTA
- [x] 카드 radius 16px 통일
- [ ] 배당 그래프 미니 차트
- [ ] 배당 캘린더 섹션
- [ ] 포트폴리오 도넛 차트

## 3. 상세페이지 (엔젤 스토리형)
- [ ] 상단 히어로: 크리에이터 대형 이미지
- [ ] 예상 연 배당률 강조
- [ ] 크리에이터 스토리 섹션
- [ ] 배당 구조 설명
- [ ] "엔젤로 참여하기" CTA
- [ ] TradingPanel 하단 보조

## 4. 지갑 페이지
- [x] 총 자산 대형 강조
- [x] 수익/손실 색상 (emerald/red)
- [x] Royal Blue CTA
- [x] 카드 radius 16px
- [ ] 월별 배당 그래프
- [ ] 보유 자산 카드형 목록 강화

## 5. 로그인 / 회원가입 / KYC
- [ ] 로그인: 중앙 카드, Royal Blue 버튼
- [ ] 회원가입: 3단계 Progress Bar
- [ ] KYC: 단계별 카드 UI
- [ ] "엔젤 등록 완료" 축하 화면

## 6. 관리자 페이지
- [ ] 정산 현황 대시보드
- [ ] 배당 지급 현황
- [ ] Royal Blue 기반 다크 톤

## 7. 전역 UI 통일
- [x] 버튼 hover/active/disabled
- [x] tap-scale 공통
- [x] 카드 radius 16px
- [x] shadow 체계
- [ ] 모든 탭 fade-in
- [ ] 빈 상태 일러스트/문구
- [ ] 토스트 통일
- [ ] 모바일 하단 네비 정리

## 8. 브랜딩 문구
- [x] "투자자" → "엔젤"
- [x] "투자하기" → "엔젤로 참여하기"
- [x] "수익률" → "예상 배당 수익률"
- [ ] 전체 프로젝트 검색·교체 완료

## 9. 숫자 포맷
- [x] formatKrw
- [x] formatRate
- [x] formatQuantity
- [x] formatCompactNumber
- [ ] 모든 숫자 출력 format 통일

## 10. Skeleton / 공백상태
- [x] shimmer skeleton 스타일
- [ ] 로딩 시 Skeleton 적용
- [ ] 빈 목록 일러스트
