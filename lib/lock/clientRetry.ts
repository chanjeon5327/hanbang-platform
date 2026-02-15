function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(ms: number): number {
  return Math.floor(Math.random() * ms);
}

function isLockBusyResponse(res: unknown): boolean {
  const r = res as { code?: string; error?: { code?: string } };
  return r?.code === "LOCK_BUSY" || r?.error?.code === "LOCK_BUSY";
}

export async function clientRetryOnLockBusy<T>(
  fn: () => Promise<T>,
  opts?: {
    retries?: number;
    delaysMs?: number[];
    jitterMs?: number;
    onAttempt?: (n: number) => void;
  }
): Promise<T> {
  const retries = opts?.retries ?? 3;
  const delays = opts?.delaysMs ?? [200, 500, 1200];
  const j = opts?.jitterMs ?? 200;

  let last: T | null = null;

  for (let i = 0; i < retries; i++) {
    opts?.onAttempt?.(i + 1);

    const res = await fn();
    if (!isLockBusyResponse(res)) return res;

    last = res;
    if (i === retries - 1) return res;

    await sleep(delays[Math.min(i, delays.length - 1)] + jitter(j));
  }

  return last!;
}
