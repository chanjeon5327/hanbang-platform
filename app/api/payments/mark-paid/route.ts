import { NextResponse } from "next/server";
import { createClient as createCookieClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // ✅ 어떤 환경이든 "schema cache" 에러는 500 금지(개발 막힘 방지)
  // ✅ 대신 JSON으로 원인 힌트를 내려준다.
  const nodeEnv = process.env.NODE_ENV ?? "(undefined)";
  const schema = process.env.SUPABASE_DB_SCHEMA ?? "public";

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = body.order_id ?? body.orderId;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "MISSING_ORDER_ID", nodeEnv, schema },
        { status: 200 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
      return NextResponse.json(
        { success: false, error: "MISSING_ENV_NEXT_PUBLIC_SUPABASE_URL", nodeEnv, schema },
        { status: 200 }
      );
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // ✅ service_role이 있으면 우선 사용(결제 콜백/서버 호출 정석)
    const supabase = serviceKey
      ? createServiceClient(url, serviceKey, { auth: { persistSession: false } })
      : createCookieClient();

    const { data, error } = await supabase
      .schema(schema)
      .from("orders")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", orderId)
      .select("id");

    if (error) {
      const msg = error.message ?? "";
      const isSchemaCache = msg.includes("schema cache");

      // ✅ schema cache 에러는 "항상 200"으로 내려서 막히지 않게
      if (isSchemaCache) {
        return NextResponse.json(
          {
            success: false,
            code: "ORDERS_NOT_IN_SCHEMA_CACHE",
            error: msg,
            nodeEnv,
            schema,
            used: serviceKey ? "service_role" : "cookie_session",
            next: [
              "1) Supabase Dashboard → Settings → API → Exposed Schemas에 public 포함 확인",
              "2) 포함돼도 동일하면 public 체크 해제→Save→다시 체크→Save (캐시 강제 갱신)",
              "3) SQL Editor에서 notify pgrst, 'reload schema'; 실행",
              "4) 그래도 동일하면 Project Restart(설정에서 Restart project)로 PostgREST 재기동",
            ],
          },
          { status: 200 }
        );
      }

      // 그 외 DB 에러는 정상적으로 500
      return NextResponse.json(
        {
          success: false,
          code: "DB_ERROR",
          error: msg,
          nodeEnv,
          schema,
          used: serviceKey ? "service_role" : "cookie_session",
        },
        { status: 500 }
      );
    }

    const updated = Array.isArray(data) ? data.length : 0;

    if (updated === 0) {
      return NextResponse.json(
        {
          success: false,
          code: "ORDER_NOT_FOUND_OR_NOT_VISIBLE",
          nodeEnv,
          schema,
          used: serviceKey ? "service_role" : "cookie_session",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        updated,
        nodeEnv,
        schema,
        used: serviceKey ? "service_role" : "cookie_session",
      },
      { status: 200 }
    );
  } catch (e: any) {
    // 런타임 파싱/예외는 500 유지
    return NextResponse.json(
      { success: false, code: "RUNTIME_ERROR", error: e?.message ?? "UNKNOWN", nodeEnv, schema },
      { status: 500 }
    );
  }
}
