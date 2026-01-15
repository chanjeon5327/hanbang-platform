import { createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // 타겟 지정 제거 (자동 감지)
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true, // 하이드레이션 에러 방지
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

