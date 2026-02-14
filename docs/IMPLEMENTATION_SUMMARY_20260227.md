# 구현 요약 (2026-02-27)

## 1) 수정/추가된 파일 전체 목록

### A) 홈 레일 구조 분리
| 경로 | 유형 |
|------|------|
| `app/api/home/my-interests/route.ts` | **추가** |
| `app/api/home/popular/route.ts` | **추가** |
| `app/api/home/deadline/route.ts` | **추가** |
| `hooks/useMyInterests.ts` | **추가** |
| `hooks/usePopularPicks.ts` | **추가** |
| `hooks/useDeadlinePicks.ts` | **추가** |
| `components/home/InterestStrip.tsx` | **수정** |
| `components/home/CurationSection.tsx` | **수정** |
| `components/home/DeadlineRail.tsx` | **수정** |
| `components/home/HomeView.tsx` | **수정** |
| `components/home/GuestPreview.tsx` | **수정** |
| `components/home/PrimaryCTAs.tsx` | **수정** |

### B) 상세 페이지 실시간 채팅
| 경로 | 유형 |
|------|------|
| `supabase/migrations/20260227_chat_profiles.sql` | **추가** |
| `app/api/chat/[productId]/route.ts` | **추가** |
| `components/chat/ProductChat.tsx` | **추가** |
| `app/market/[id]/page.tsx` | **수정** |

### C) 프로필 페이지
| 경로 | 유형 |
|------|------|
| `app/api/profile/[id]/route.ts` | **추가** |
| `app/profile/[id]/page.tsx` | **추가** |

### D) VideoThumb
| 경로 | 유형 |
|------|------|
| `components/media/VideoThumb.tsx` | **추가** |

---

## 2) 데이터 흐름 다이어그램

### 홈 레일 (나의 관심 / 모두의 추천 / 마감임박)

```
┌─────────────────────────────────────────────────────────────────┐
│                         HomeView                                 │
├─────────────────────────────────────────────────────────────────┤
│  InterestStrip          CurationSection         DeadlineRail    │
│  (나의 관심)             (모두의 추천)            (마감임박)      │
│       │                        │                      │         │
│  useMyInterests         usePopularPicks       useDeadlinePicks   │
│  (enabled=로그인)       (enabled=true)        (enabled=true)    │
│       │                        │                      │         │
└───────┼────────────────────────┼──────────────────────┼─────────┘
        │                        │                      │
        ▼                        ▼                      ▼
┌───────────────┐    ┌───────────────────┐    ┌───────────────────┐
│ GET /api/home │    │ GET /api/home/    │    │ GET /api/home/    │
│ my-interests  │    │ popular           │    │ deadline          │
│               │    │                   │    │                   │
│ user_interests│    │ user_interests    │    │ content_items     │
│ + content_    │    │ count by content  │    │ deadline > now()  │
│ items         │    │ _id               │    │ order by deadline │
└───────────────┘    └───────────────────┘    └───────────────────┘
```

### 채팅 (읽기/쓰기/Realtime/프로필)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ProductChat (market/[id])                     │
├─────────────────────────────────────────────────────────────────┤
│  GET /api/chat/[productId]  ──►  messages + profiles(nickname,  │
│                                    avatar_url)                   │
│  POST (로그인)  ──►  filterProfanity  ──►  product_chat_messages│
│  Supabase Realtime  ──►  INSERT 이벤트  ──►  fetchMessages()     │
│  닉네임/아바타 클릭  ──►  /profile/[user_id]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3) 완료 체크리스트 (12개)

| # | 항목 | 상태 |
|---|------|------|
| 1 | A-1: GET /api/home/my-interests (로그인만, created_at desc) | ✅ PASS |
| 2 | A-1: GET /api/home/popular (관심 count desc, 동률 random) | ✅ PASS |
| 3 | A-1: GET /api/home/deadline (deadline asc, 같은 날 random) | ✅ PASS |
| 4 | A-2: useMyInterests, usePopularPicks, useDeadlinePicks 훅 | ✅ PASS |
| 5 | A-3: 나의 관심/모두의 추천/마감임박 단일 데이터 소스, 중복 제거 | ✅ PASS |
| 6 | B-1: 20260227_chat_profiles.sql (profiles, product_chat_messages, RLS) | ✅ PASS |
| 7 | B-2: GET/POST /api/chat/[productId], profiles join | ✅ PASS |
| 8 | B-3: ProductChat (닉네임+아바타, /profile 이동, Realtime) | ✅ PASS |
| 9 | C: /profile/[id] 페이지, API, fallback | ✅ PASS |
| 10 | D: VideoThumb (hover/touch play, muted, 스피커 버튼) | ✅ PASS |
| 11 | 랜덤 정렬 서버 전용 (클라이언트 Math.random 금지) | ✅ PASS |
| 12 | 채팅 POST 로그인 필수, profiles 공개 필드 최소화 | ✅ PASS |

---

## 4) 주의사항

- **마이그레이션 적용**: `supabase db push` 또는 `supabase migration up` 실행 필요
- **Realtime**: product_chat_messages 테이블에 Replication 활성화 필요 (Supabase 대시보드)
- **product_id**: market 상세 id가 UUID일 때 채팅 동작. sample-1 등 문자열 id는 빈 메시지 반환
- **content_items.deadline**: 마이그레이션에서 추가. 데이터 입력 시 마감임박 API 정상 동작
