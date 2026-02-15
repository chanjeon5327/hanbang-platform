import { clientRetryOnLockBusy } from "./clientRetry";

export type PlaceOrderbookParams = {
  item_id: string;
  side: "bid" | "ask";
  price_usd: number;
  quantity: number;
  price_krw?: number | null;
  idempotency_key?: string;
};

export type PlaceOrderbookResult = {
  success?: boolean;
  order_id?: string;
  matched_count?: number;
  ok?: boolean;
  code?: string;
  error?: string;
};

export async function placeOrderbookOrder(
  params: PlaceOrderbookParams,
  opts?: { onAttempt?: (n: number) => void }
): Promise<PlaceOrderbookResult> {
  const idempotencyKey = params.idempotency_key ?? crypto.randomUUID();
  const body = {
    item_id: params.item_id,
    side: params.side,
    price_usd: params.price_usd,
    quantity: params.quantity,
    price_krw: params.price_krw ?? null,
    idempotency_key: idempotencyKey,
  };

  const res = await clientRetryOnLockBusy(
    async () => {
      const r = await fetch("/api/orders/orderbook/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json();
      if (!r.ok) {
        return { ...json, ok: false, code: json?.code ?? json?.error };
      }
      return { ...json, success: json?.success, ok: true };
    },
    { retries: 3, delaysMs: [200, 500, 1200], jitterMs: 200, onAttempt: opts?.onAttempt }
  );

  return res as PlaceOrderbookResult;
}
