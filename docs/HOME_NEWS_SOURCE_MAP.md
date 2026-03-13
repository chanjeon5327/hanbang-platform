# 홈 하단 뉴스 섹션 소스 매핑

> 소스 파일: `components/home/NewsSection.tsx`
> 이미지 저장 경로: `public/news/2026-03/`
> 최종 업데이트: 2026-03-14

## 매핑 테이블

| # | 기사 제목 | 출처 | 원문 URL | 추출한 이미지 URL(원본) | 저장한 로컬 파일 경로 | 적용 여부 |
|---|----------|------|---------|------------------------|---------------------|----------|
| 1 | 허훈 서울시의원 "서울시 차원의 한류산업 지원 및 육성 위한 '한류산업진흥 조례' 본회의 통과" | 서울신문 | https://go.seoul.co.kr/news/newsView.php?id=20260313500202&wlog_tag3=naver | https://imggo.seoul.co.kr/img/go_share.png | /news/2026-03/seoul-hallyu-ordinance.jpg | ✅ |
| 2 | 한류 타고 번지는 중국산 '짝퉁 K-브랜드' 점입가경…"외국 소비자 혼란 우려" | Industry News | https://www.industrynews.co.kr/news/articleView.html?idxno=78973 | https://cdn.industrynews.co.kr/news/photo/202603/78973_97283_4931.jpg | /news/2026-03/kbrand-counterfeit.jpg | ✅ |
| 3 | "BTS 단독 굿즈 어디서?" 신세계면세점 명동점, 방탄 신상 굿즈 판매 | 뉴시스 | https://www.newsis.com/view/NISX20260311_0003543114 | https://img1.newsis.com/2026/03/11/NISI20260311_0002080655_web.jpg | /news/2026-03/bts-goods-shinsegae.jpg | ✅ |

**총 3개 기사 — 전체 적용 완료**

---

## 적용 방식 설명

- **추출 방식**: 각 기사 페이지의 `og:image` 메타 태그에서 URL 추출
- **리사이징**: 1200×675 (16:9) 비율로 통일, `object-fit: cover` 적용
- **저장 경로**: `public/news/2026-03/{slug}.jpg`
- **적용 위치**: `components/home/NewsSection.tsx` 내 `NEWS` 배열

---

## 썸네일 재생성

이미지를 다시 다운로드·리사이징하려면:

```bash
node scripts/fetch-news-thumbnails.mjs
```
