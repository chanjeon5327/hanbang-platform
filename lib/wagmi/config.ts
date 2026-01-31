import { createConfig, http } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { sepolia } from 'wagmi/chains';

export const wagmiConfig = createConfig({
  chains: [sepolia], // ✅ 최소 1개 체인 필수
  connectors: [
    metaMask(), // MetaMask만 유지
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
