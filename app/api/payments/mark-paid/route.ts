import { NextResponse } from "next/server";
import { createClient as createCookieClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * GATE-0 최종 목표:
 * - 어떤 경우에도 500 금지(항상 200 JSON)
 * - settled/paid/completed 등 최종상태는 되돌림 금지(멱등 NOOP)
 * - paid_at 컬럼 없어도 동작(status만 업데이트)
 */
export async function POST(req: Request) {
  const nodeEnv = process.env.NODE_ENV ?? "(undefined)";
  const schema = process.env.SUPABASE_DB_SCHEMA ?? "public";

  const ok = (payload: any) => NextResponse.json(payload, { status: 200 });

  try {
    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body.order_id ?? body.orderId;

    if (!orderId) {
      return ok({ success: false, code: "MISSING_ORDER_ID", nodeEnv, schema });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      return ok({
        success: false,
        code: "MISSING_ENV_NEXT_PUBLIC_SUPABASE_URL",
        nodeEnv,
        schema,
      });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabase = serviceKey
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false } })
      : createCookieClient();

    // 1) 주문 상태 조회
    const { data: order, error: readErr } = await supabase
      .schema(schema)
      .from("orders")
      .select("id,status")
      .eq("id", orderId)
      .maybeSingle();

    if (readErr) {
      const msg = readErr.message ?? "";
      return ok({
        success: false,
        code: msg.includes("schema cache") ? "SCHEMA_CACHE_ERROR" : "ORDER_READ_ERROR",
        error: msg,
        order_id: orderId,
        nodeEnv,
        schema,
        used: serviceKey ? "service_role" : "cookie_session",
      });
    }

    if (!order) {
      return ok({
        success: false,
        code: "ORDER_NOT_FOUND",
        order_id: orderId,
        nodeEnv,
        schema,
        used: serviceKey ? "service_role" : "cookie_session",
      });
    }

    const currentStatus = String((order as any).status ?? "").toLowerCase();

    // 2) 최종상태는 되돌림 금지(멱등)
    if (["paid", "completed", "settled", "cancelled", "canceled"].includes(currentStatus)) {
      return ok({
        success: true,
        code: `NOOP_ALREADY_${currentStatus.toUpperCase()}`,
        order_id: orderId,
        status: currentStatus,
        updated: 0,
        nodeEnv,
        schema,
        used: serviceKey ? "service_role" : "cookie_session",
      });
    }

    // 3) markable 상태만 paid로 전환
    const markable = ["pending", "unpaid", "created"];
    if (!markable.includes(currentStatus)) {
      return ok({
        success: true,
        code: "NOOP_STATUS_NOT_MARKABLE",
        order_id: orderId,
        status: currentStatus,
        updated: 0,
        nodeEnv,
        schema,
        used: serviceKey ? "service_role" : "cookie_session",
      });
    }

    // 4) 업데이트 (paid_at 없음 → status만)
    const { data: updatedRows, error: upErr } = await supabase
      .schema(schema)
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId)
      .select("id");

    if (upErr) {
      const msg = upErr.message ?? "";
      return ok({
        success: false,
        code: msg.includes("schema cache") ? "SCHEMA_CACHE_ERROR" : "ORDER_UPDATE_ERROR",
        error: msg,
        order_id: orderId,
        prev_status: currentStatus,
        nodeEnv,
        schema,
        used: serviceKey ? "service_role" : "cookie_session",
      });
    }

    const updated = Array.isArray(updatedRows) ? updatedRows.length : 0;

    return ok({
      success: true,
      code: updated === 1 ? "MARK_PAID_OK" : "MARK_PAID_NO_ROWS_UPDATED",
      order_id: orderId,
      prev_status: currentStatus,
      updated,
      nodeEnv,
      schema,
      used: serviceKey ? "service_role" : "cookie_session",
    });
  } catch (e: any) {
    // ✅ 여기까지도 500 금지
    return ok({
      success: false,
      code: "RUNTIME_ERROR",
      error: e?.message ?? "UNKNOWN",
      nodeEnv,
      schema,
    });
  }
}
