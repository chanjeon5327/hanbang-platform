# HANBANG 다음 스프린트 — Compose 프롬프트

> 가장 가치 큰 다음 1개 스프린트용 프롬프트

---

## 스프린트: 마이페이지 완성 (투자자 허브)

### 목표

마이페이지(`/mypage`)에서 **내 자산 요약 / 보유 자산 / 주문 내역 / 원장 내역**을 orders, ledger_entries 기반으로 실제 데이터로 표시한다.

### 범위

- **MyAssetSummary**: `GET /api/wallet/ledger` 또는 `orders` 집계로 총 자산·예수금·평가손익 계산
- **MyInvestList**: `ledger_entries`(ASSET_CREDIT) 또는 `orders` + `products` 조인으로 보유 수익권 목록
- **MyHistory**: `orders` 또는 `ledger_entries` 기반 주문/거래 내역
- **주문 내역 / 정산 내역 / 입출금 기록**: 링크 클릭 시 해당 화면으로 이동 (또는 모달)

### 제약

- DB 스키마/기존 RPC 최대한 유지
- 로직 변경 최소화
- Tailwind 유지, 새 UI 라이브러리 추가 금지
- 모바일 우선

### 완료 기준

- [ ] MyAssetSummary: orders·ledger 집계 기반 총 자산 표시
- [ ] MyInvestList: 실제 보유 자산(상품별 수량/평단) 표시
- [ ] MyHistory 또는 주문 내역: orders(status 포함) 목록 표시
- [ ] 원장 내역: ledger_entries 또는 `/api/wallet/ledger` 연동
- [ ] 타입/빌드 에러 없음

### 참고 파일

| 파일 | 용도 |
|------|------|
| `app/mypage/page.tsx` | 마이페이지 진입점 |
| `components/mypage/MyAssetSummary.tsx` | 자산 요약 카드 |
| `components/mypage/MyInvestList.tsx` | 보유 수익권 목록 |
| `components/mypage/MyHistory.tsx` | 기록 메뉴 |
| `app/api/wallet/ledger/route.ts` | 원장 API (세션 기반) |
| `app/api/orders/[id]/route.ts` | 주문 조회 |
| `supabase/migrations/202601290539_ledger.sql` | ledger_entries 스키마 |

---

## Cursor Compose 프롬프트 (복사용)

```
[HANBANG 마이페이지 완성 스프린트]

목표:
- /mypage에서 내 자산/보유/주문/원장을 orders, ledger_entries 기반 실제 데이터로 표시

범위:
- MyAssetSummary: orders·ledger 집계로 총 자산/예수금/평가손익
- MyInvestList: ledger_entries(ASSET_CREDIT) 또는 orders+products로 보유 수익권
- MyHistory: orders 목록 또는 ledger 기반 거래 내역
- 주문 내역/정산 내역/입출금 링크 → 해당 화면 또는 모달

제약:
- DB/RPC 최대한 유지, 로직 변경 최소
- Tailwind 유지, 새 UI 라이브러리 금지
- 모바일 우선

참고: docs/SCREENS_MAP.md, docs/STATUS_BOARD.md, app/api/wallet/ledger/route.ts
```
