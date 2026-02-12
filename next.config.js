const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 외부 이미지 허용
  images: {
    remotePatterns: [
      // 기존 상품 이미지(Unsplash)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },

      // 이번에 바꾼 이미지(Picsum)
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
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
