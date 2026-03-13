# 유튜브 썸네일 소스 매핑

> 소스 파일: `lib/mock/marketItems.ts`
> 적용 방식: 유튜브 대표 영상 썸네일 (`i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg`)
> 최종 업데이트: 2026-03-13

## 매핑 테이블

| # | 아이템명 | slug | 유튜브 채널 | 채널 URL | 영상 ID | 최종 thumbnail URL | 적용 방식 |
|---|---------|------|-----------|---------|---------|-------------------|----------|
| 1 | 블루웨이 시즌3 | travel-j | 빠니보틀 | https://www.youtube.com/@PaniBottle | RCApmj8sj1c | https://i.ytimg.com/vi/RCApmj8sj1c/hqdefault.jpg | 대표영상 |
| 2 | 라운지 나인 | chim | 침착맨 | https://www.youtube.com/@chimchakman_official | FSPwreQ-3yg | https://i.ytimg.com/vi/FSPwreQ-3yg/hqdefault.jpg | 대표영상 |
| 3 | 총몇명 | chong | 장삐쭈 | https://www.youtube.com/@jangbbijju | 5CM__BSlKXU | https://i.ytimg.com/vi/5CM__BSlKXU/hqdefault.jpg | 대표영상 |
| 4 | 테이블 로그 | muklab | 쯔양 | https://www.youtube.com/@tzuyang6145 | dMjQ3hA9mEA | https://i.ytimg.com/vi/dMjQ3hA9mEA/hqdefault.jpg | 대표영상 |
| 5 | 스포츠픽 | sports-pick | 이스타TV | https://www.youtube.com/@LeeStarTV | 9gNmmjgcIBM | https://i.ytimg.com/vi/9gNmmjgcIBM/hqdefault.jpg | 대표영상 |
| 6 | K드라마 하이라이트 | k-drama | tvN DRAMA | https://www.youtube.com/@tvNDRAMA | WDOGovyu-C4 | https://i.ytimg.com/vi/WDOGovyu-C4/hqdefault.jpg | 대표영상 |
| 7 | 사운드 플로어 | kpop-stage | 딩고 뮤직 | https://www.youtube.com/@dingomusic | o7mx1j6AK0Q | https://i.ytimg.com/vi/o7mx1j6AK0Q/hqdefault.jpg | 대표영상 |
| 8 | 푸드트립 | food-trip | 성시경 | https://www.youtube.com/@sungsikyung | 6RQ-bBdASvk | https://i.ytimg.com/vi/6RQ-bBdASvk/hqdefault.jpg | 대표영상 |
| 9 | 도시산책 | city-walk | 곽튜브 | https://www.youtube.com/@JBKWAK | _ycZgDAKe6Q | https://i.ytimg.com/vi/_ycZgDAKe6Q/hqdefault.jpg | 대표영상 |
| 10 | 이슈토크 | talk-issue | 슈카월드 | https://www.youtube.com/@syukaworld | WJPuOuVbFEQ | https://i.ytimg.com/vi/WJPuOuVbFEQ/hqdefault.jpg | 대표영상 |
| 11 | 게임연구실 | game-lab | 김성회의 G식백과 | https://www.youtube.com/@G-Encyclopedia | NgAvdXPfvfo | https://i.ytimg.com/vi/NgAvdXPfvfo/hqdefault.jpg | 대표영상 |
| 12 | 다큐NOW | docu-now | KBS 다큐 | https://www.youtube.com/@KBSDocumentary | eXviZ7rhozA | https://i.ytimg.com/vi/eXviZ7rhozA/hqdefault.jpg | 대표영상 |
| 13 | 코미디컷 | comedy-cut | 숏박스 | https://www.youtube.com/@shortbox | tVaLKUQtgq4 | https://i.ytimg.com/vi/tVaLKUQtgq4/hqdefault.jpg | 대표영상 |
| 14 | 뷰티톡 | beauty-talk | 이사배 | https://www.youtube.com/@Risabae | 07KggGt5P3M | https://i.ytimg.com/vi/07KggGt5P3M/hqdefault.jpg | 대표영상 |
| 15 | 키즈월드 | kids-world | 캐리와 장난감 친구들 | https://www.youtube.com/@CarrieAndToys | GGtHMuu2kGY | https://i.ytimg.com/vi/GGtHMuu2kGY/hqdefault.jpg | 대표영상 |
| 16 | 역사연구소 | history-lab | 조승연의 탐구생활 | https://www.youtube.com/@ChoSeungyeon | i7hILjPRBYo | https://i.ytimg.com/vi/i7hILjPRBYo/hqdefault.jpg | 대표영상 |
| 17 | 필름 하우스 | cinema-buster | 거의없다 | https://www.youtube.com/@mwhahaha | bWaAB7ju7Mk | https://i.ytimg.com/vi/bWaAB7ju7Mk/hqdefault.jpg | 대표영상 |
| 18 | 스포츠 LIVE | sports-live | 쿠팡플레이 스포츠 | https://www.youtube.com/@CoupangPlaySports | 2mHo90QiJ4U | https://i.ytimg.com/vi/2mHo90QiJ4U/hqdefault.jpg | 대표영상 |
| 19 | 아시아여행 | travel-asia | 희철리즘 | https://www.youtube.com/@Heechulism | q0V0fIkPKQQ | https://i.ytimg.com/vi/q0V0fIkPKQQ/hqdefault.jpg | 대표영상 |
| 20 | 먹스타 | muk-star | 입짧은햇님 | https://www.youtube.com/@muksunyoung | MH__ruXBK_E | https://i.ytimg.com/vi/MH__ruXBK_E/hqdefault.jpg | 대표영상 |

**총 20개 종목 — 전체 유튜브 대표영상 썸네일 적용 완료**

---

## 적용 방식 설명

- **소스**: 각 유튜브 채널의 인기/대표 영상 1개를 선정
- **URL 형식**: `https://i.ytimg.com/vi/{VIDEO_ID}/hqdefault.jpg` (480×360)
- **fallback 순서**: maxresdefault → sddefault → hqdefault (현재 hqdefault 통일 적용)
- **적용 위치**: `lib/mock/marketItems.ts` 내 `thumbnail` 필드

---

## 교체 방법

특정 아이템의 썸네일을 변경하려면:

```ts
// lib/mock/marketItems.ts 내 YT_VIDEO_MAP 에서 해당 slug의 영상 ID만 교체
const YT_VIDEO_MAP: Record<string, string> = {
  'travel-j': 'NEW_VIDEO_ID_HERE',
  // ...
};
```

실제 이미지 파일로 교체하려면:

```ts
// thumbnail 필드를 직접 이미지 경로로 변경
thumbnail: '/images/market/travel-j.jpg',
```
