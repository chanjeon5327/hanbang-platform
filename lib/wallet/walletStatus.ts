import { isAuthenticated } from "@/lib/auth/session";
import { getAccount } from "@wagmi/core";
import { config } from "@/lib/wagmi";

/**
 * 지갑 + 인증 상태의 유일한 기준
 */
export type WalletStatus =
  | "ANON"        // 로그인 X / 지갑 X
  | "AUTH_ONLY"   // 로그인 O / 지갑 X
  | "AUTH_WALLET" // 로그인 O / 지갑 O
;

/**
 * 현재 유저의 지갑 상태를 판단한다
 * - 로그인(Supabase) + 지갑(Wagmi)을 동시에 고려
 * - 지갑만 연결된 상태는 허용하지 않는다
 */
export async function getWalletStatus(): Promise<WalletStatus> {
  const authed = await isAuthenticated();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const account = getAccount(config as any);

  if (!authed && !account.isConnected) return "ANON";
  if (authed && !account.isConnected) return "AUTH_ONLY";
  if (authed && account.isConnected) return "AUTH_WALLET";

  // 지갑만 연결된 상태 (의도적으로 무효 처리)
  return "ANON";
}
