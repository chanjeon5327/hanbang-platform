function isLockBusy(e: unknown): boolean {
  const code = (e as any)?.code ?? (e as any)?.error?.code;
  const msg = ((e as any)?.message ?? (e as any)?.error ?? "").toString();
  return code === "LOCK_BUSY" || msg.includes("LOCK_BUSY");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(baseMs: number): number {
  return Math.floor(Math.random() * baseMs);
}

export async function retryOnLockBusy<T>(
  fn: () => Promise<T>,
  opts?: { retries?: number; baseDelayMs?: number; jitterMs?: number }
): Promise<T> {
  const retries = opts?.retries ?? 2;
  const base = opts?.baseDelayMs ?? 80;
  const j = opts?.jitterMs ?? 120;

  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isLockBusy(e)) throw e;
      if (attempt === retries) throw e;

      const wait = base + jitter(j);
      await sleep(wait);
    }
  }

  throw lastErr;
}

/** rpc_match_orders 결과에 LOCK_BUSY가 있는지 확인 */
export function isLockBusyInResult(result: unknown): boolean {
  const r = result as { match_result?: { note?: string }; note?: string };
  return r?.match_result?.note === "LOCK_BUSY" || r?.note === "LOCK_BUSY";
}
