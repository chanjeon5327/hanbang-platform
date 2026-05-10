const { withSentryConfig } = require('@sentry/nextjs');

const isDev = process.env.NODE_ENV !== 'production';

// QA H1 대응:
//  (1) 광범위한 style={{...}} 인라인 스타일을 한 번에 제거할 수 없어
//      운영에서도 style-src에 'unsafe-inline'을 허용한다.
//  (2) Next.js 16(App Router)이 SSR HTML head에 hydration/스트리밍/플라이트 데이터를
//      inline <script> 로 삽입한다(여러 개). 운영 CSP가 'self' https: 만 허용하면
//      이 inline 스크립트가 모두 차단되어 React hydration 자체가 실패하고
//      Suspense fallback만 남아 /login 등이 빈 화면으로 보였다.
//      안전한 항구 대책은 미들웨어에서 per-request nonce를 발급해 'strict-dynamic'을
//      적용하는 것이지만, 이번 라운드에서는 프레임워크가 안전하게 사용하는 inline
//      script만 허용하기 위해 script-src 에도 'unsafe-inline'을 둔다.
//      (eval은 운영에서 계속 차단)
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline' https:";
const styleSrc = "'self' 'unsafe-inline'";
const connectSrc = isDev ? "'self' http: https:" : "'self' https:";

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  `style-src ${styleSrc}`,
  "img-src 'self' data: https:",
  `connect-src ${connectSrc}`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "font-src 'self' data: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // metadata를 head에 blocking으로 출력 (streaming metadata 비활성화)
  // 링크 썸네일/og:image 등이 프로덕션 HTML head에 포함되도록 함
  htmlLimitedBots: /.*/,

  headers: async () => [
    {
      source: '/(.*)',
      headers: [{ key: 'Content-Security-Policy', value: csp }],
    },
  ],

  // 외부 이미지 허용 (Next/Image용, 로컬 /placeholders/는 public에서 자동 제공)
  images: {
    remotePatterns: [
      // 기존 상품 이미지(Unsplash)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },

      // 이번에 바꾼 이미지(Picsum)
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },

      // Supabase Storage (뉴스/상품 썸네일)
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.supabase.in", pathname: "/storage/v1/object/public/**" },
    ],
  },

  // dev에서 127.0.0.1 접속 시 _next 리소스 차단 방지
  // (호스트만 넣어야 함: 포트/프로토콜 X)
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
