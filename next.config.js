const { withSentryConfig } = require('@sentry/nextjs');

const isDev = process.env.NODE_ENV !== 'production';

// dev: inline/eval 허용으로 콘솔 에러 제거 | prod: 보안형
const scriptSrc = isDev ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' https:";
const styleSrc = isDev ? "'self' 'unsafe-inline'" : "'self'";
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
