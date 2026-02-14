# 결과물 제출: 마켓 플랫폼 런칭 준비

## 1. 신규 마이그레이션 통코

| 파일 | 설명 |
|------|------|
| `20260214_notifications.sql` | notifications 테이블, RLS |
| `20260214_rpc_invest_and_notify.sql` | 투자+원장+알림 원자적 RPC |
| `20260214_profanity_filter_table.sql` | profanity_words 테이블 준비 |
| `20260214_deadline_index.sql` | content_items deadline 인덱스 |

## 2. 수정 마이그레이션

| 파일 | 변경 내용 |
|------|-----------|
| `20260228_popular_mv.sql` | idx_popular_content_mv_cnt_desc 추가, cron 주석 |

## 3. 신규 RPC

| RPC | 용도 |
|-----|------|
| `rpc_invest_and_notify` | 투자 시 order+ledger+content_items+notifications 원자적 처리 |

## 4. 수정 API

| API | 변경 내용 |
|-----|-----------|
| `POST /api/orders/place` | rpc_invest_and_notify 호출로 전환 |
| `GET/POST /api/notifications` | 실DB 연동 |
| `PATCH /api/notifications/[id]/read` | is_read 업데이트 |
| `GET /api/chat/[productId]` | cursor pagination, pinned 별도 query |
| `GET /api/market/item/[id]` | participants 추가 |
| `GET /api/market/recent-invest/[id]` | 신규 (orders 기반 최근 투자 로그) |

## 5. 데이터 흐름 다이어그램

```
┌─────────────┐     POST /api/orders/place      ┌─────────────┐
│   Frontend  │ ──────────────────────────────►│  Place API   │
│ (Market)    │     { product_id, amount }     │             │
└─────────────┘                                └──────┬──────┘
       │                                               │
       │ invest-success event                          │ rpc_invest_and_notify
       │                                               ▼
       │                                      ┌────────────────┐
       │                                      │  Supabase DB   │
       │                                      │  (트랜잭션)    │
       │                                      │  - orders      │
       │                                      │  - ledger      │
       │                                      │  - content_items│
       │                                      │  - notifications│
       │                                      └────────┬───────┘
       │                                               │
       ▼                                               │
┌─────────────┐     GET /api/wallet/invest-summary    │
│ InvestorDash│ ◄─────────────────────────────────────┤
│ BoardCard   │     GET /api/notifications             │
└─────────────┘     GET /api/market/recent-invest/[id]│
       ▲                                               │
       │ refetch                                       │
       └───────────────────────────────────────────────┘
```

## 6. 상태 전이 다이어그램 (Order)

```
     [투자 요청]
          │
          ▼
    ┌──────────┐
    │ COMPLETED │  ← rpc_invest_and_notify (즉시 완료)
    └────┬─────┘
         │
         │ (정산 배치)
         ▼
    ┌──────────┐
    │  SETTLED  │
    └──────────┘

※ 마켓 투자는 PENDING/PAID 단계 없이 즉시 COMPLETED
```

## 7. 최종 런칭 준비 체크리스트

### DB / 마이그레이션
- [ ] `supabase db push` 또는 마이그레이션 적용
- [ ] notifications 테이블 생성 확인
- [ ] rpc_invest_and_notify 함수 존재 확인
- [ ] content_items.current_raise 초기값 확인 (NULL → 0)

### API
- [ ] POST /api/orders/place → rpc_invest_and_notify 호출 동작
- [ ] GET /api/notifications → 본인 알림 목록 반환
- [ ] PATCH /api/notifications/[id]/read → is_read 업데이트
- [ ] GET /api/market/recent-invest/[id] → orders 기반 로그

### 프론트
- [ ] InvestorDashboardCard 실데이터 (총 투자금, 평균 수익률, 이번 달 수익)
- [ ] ExpectedReturnBox yield_rate DB값 사용
- [ ] MarketStatsBar progress = current_raise/total_raise
- [ ] RecentInvestLog API 연동
- [ ] NotificationBell unread count, is_read 업데이트
- [ ] 투자 성공 시 invest-success → 대시보드 refetch

### 보안 / 검증
- [ ] ledger_entries RLS/권한 확인
- [ ] orders UPDATE 플래그 검증 확인
- [ ] rpc_invest_and_notify 잔액 검증

### 성능
- [ ] popular_content_mv cnt desc 인덱스
- [ ] content_items (status, deadline) 인덱스
- [ ] product_chat_messages (product_id, created_at desc) 인덱스
