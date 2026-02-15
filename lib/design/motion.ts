/**
 * fade/slide/scale/tap 애니메이션 duration/easing 상수화
 */
export const motion = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },
  easing: {
    easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  tapScale: 0.98,
} as const;
