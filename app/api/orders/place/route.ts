import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type ColumnMeta = {
  column_name: string;
  is_nullable: 'YES' | 'NO' | string;
  column_default: string | null;
  data_type: string | null;
  udt_name: string | null;
  is_identity?: 'YES' | 'NO' | string | null;
};

type FkTarget = { table: string; column: string } | null;

const BANNED_ORDER_COLS = new Set(['amount_krw', 'fee_krw', 'total_krw', 'notional_krw']); // ← 절대 넣지 않음

function nowIso() {
  return new Date().toISOString();
}
function n(v: unknown) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}
function pickError(e: unknown) {
  const err = e as { message?: string; code?: string; details?: string; hint?: string };
  return {
    message: err?.message ?? String(e ?? ''),
    code: err?.code ?? null,
    details: err?.details ?? null,
    hint: err?.hint ?? null,
  };
}
function toErrString(prefix: string, e: unknown) {
  const pe = pickError(e);
  return [
    prefix,
    pe.message ? `msg=${pe.message}` : '',
    pe.code ? `code=${pe.code}` : '',
    pe.details ? `details=${pe.details}` : '',
    pe.hint ? `hint=${pe.hint}` : '',
  ]
    .filter(Boolean)
    .join(' | ');
}

function setIf(colSet: Set<string>, payload: Record<string, unknown>, candidates: string[], value: unknown) {
  for (const c of candidates) {
    if (colSet.has(c) && !BANNED_ORDER_COLS.has(c)) {
      payload[c] = value;
      return c;
    }
  }
  return null;
}

async function getColumns(supabase: any): Promise<ColumnMeta[] | null> {
  try {
    if (typeof (supabase as any).schema === 'function') {
      const { data, error } = await (supabase as any)
        .schema('information_schema')
        .from('columns')
        .select('column_name,is_nullable,column_default,data_type,udt_name,is_identity')
        .eq('table_schema', 'public')
        .eq('table_name', 'orders');
      if (error) return null;
      return Array.isArray(data) ? (data as ColumnMeta[]) : null;
    }
  } catch {
    // ignore
  }
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name,is_nullable,column_default,data_type,udt_name,is_identity')
      .eq('table_schema', 'public')
      .eq('table_name', 'orders');
    if (error) return null;
    return Array.isArray(data) ? (data as ColumnMeta[]) : null;
  } catch {
    return null;
  }
}

async function safeSelectById(supabase: any, table: string, id: string, select: string) {
  try {
    const { data, error } = await supabase.from(table).select(select).eq('id', id).limit(1);
    if (error) return null;
    return Array.isArray(data) && data[0] ? data[0] : null;
  } catch {
    return null;
  }
}
async function safeSelectFirst(supabase: any, table: string, select: string) {
  try {
    const { data, error } = await supabase.from(table).select(select).limit(1);
    if (error) return null;
    return Array.isArray(data) && data[0] ? data[0] : null;
  } catch {
    return null;
  }
}

/**
 * orders.product_id FK가 어디로 걸리는지 찾아서(대부분 products.id) 반환
 * 실패하면 null
 */
async function getProductIdFkTarget(supabase: any): Promise<FkTarget> {
  try {
    let kcu: unknown[] = [];
    if (typeof (supabase as any).schema === 'function') {
      const r = await (supabase as any)
        .schema('information_schema')
        .from('key_column_usage')
        .select('constraint_name,constraint_schema')
        .eq('table_schema', 'public')
        .eq('table_name', 'orders')
        .eq('column_name', 'product_id')
        .limit(5);
      if (r.error || !Array.isArray(r.data)) return null;
      kcu = r.data;
    } else {
      const r = await supabase
        .from('information_schema.key_column_usage')
        .select('constraint_name,constraint_schema')
        .eq('table_schema', 'public')
        .eq('table_name', 'orders')
        .eq('column_name', 'product_id')
        .limit(5);
      if (r.error || !Array.isArray(r.data)) return null;
      kcu = r.data;
    }

    for (const row of kcu as Record<string, unknown>[]) {
      const constraintName = row?.constraint_name;
      const constraintSchema = (row?.constraint_schema ?? 'public') as string;
      if (!constraintName) continue;

      let ccu: unknown[] = [];
      if (typeof (supabase as any).schema === 'function') {
        const r2 = await (supabase as any)
          .schema('information_schema')
          .from('constraint_column_usage')
          .select('table_name,column_name')
          .eq('constraint_schema', constraintSchema)
          .eq('constraint_name', constraintName)
          .limit(1);
        if (r2.error) continue;
        ccu = Array.isArray(r2.data) ? r2.data : [];
      } else {
        const r2 = await supabase
          .from('information_schema.constraint_column_usage')
          .select('table_name,column_name')
          .eq('constraint_schema', constraintSchema)
          .eq('constraint_name', constraintName)
          .limit(1);
        if (r2.error) continue;
        ccu = Array.isArray(r2.data) ? r2.data : [];
      }

      const c = ccu[0] as Record<string, unknown> | undefined;
      if (c?.table_name && c?.column_name) {
        return { table: String(c.table_name), column: String(c.column_name) };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function guessDefaultForColumn(col: string, meta: ColumnMeta | undefined, ctx: Record<string, unknown>) {
  const name = col.toLowerCase();
  const dt = (meta?.data_type ?? '').toLowerCase();
  const udt = (meta?.udt_name ?? '').toLowerCase();

  if (BANNED_ORDER_COLS.has(col)) return undefined;

  if (name.includes('created_at') || name.includes('updated_at') || dt.includes('timestamp')) return nowIso();
  if (dt === 'boolean') return false;

  if (name.includes('status')) return ctx.status ?? 'PENDING';
  if (name.includes('side') || name.includes('direction')) return ctx.side ?? 'BUY';
  if (name === 'order_type') return ctx.orderType ?? 'BUY';
  if (name === 'type' || name.includes('order_kind')) return ctx.kind ?? 'LIMIT';

  if (name.includes('price')) return ctx.price ?? 0;
  if (name.includes('qty') || name.includes('quantity') || name.includes('shares') || name.includes('units')) return ctx.qty ?? 1;
  if (name.includes('amount') || name.includes('total') || name.includes('notional')) return ctx.amount ?? 0;

  if (dt === 'text' || dt === 'character varying' || dt === 'character') return 'DEMO';
  if (dt.includes('int') || dt.includes('numeric') || dt.includes('double') || dt.includes('real') || udt.includes('int') || udt.includes('numeric')) return 0;

  return undefined;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await createClient();
  const DEMO_TRADING = process.env.DEMO_TRADING === 'true';

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (userErr || !user) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const contentId: string =
    String(
      body?.content_id ??
        body?.contentId ??
        body?.content_item_id ??
        body?.contentItemId ??
        body?.id ??
        ''
    ).trim();

  if (!contentId) return NextResponse.json({ ok: false, error: 'MISSING_CONTENT_ID' }, { status: 400 });

  const bodyProductId: string =
    String(body?.product_id ?? body?.productId ?? body?.product ?? '').trim();

  const rawAmount = n(body?.amount ?? body?.total ?? body?.total_amount ?? 0);
  const rawPrice = n(body?.price ?? body?.price_krw ?? body?.priceKrw ?? 0);
  const rawQty = n(body?.qty ?? body?.quantity ?? body?.shares ?? 0);

  const contentItemRow =
    (await safeSelectById(supabase, 'content_items', contentId, '*')) ??
    (await safeSelectById(supabase, 'content_item', contentId, '*')) ??
    null;

  const productRow =
    (await safeSelectById(supabase, 'products', contentId, '*')) ??
    (await safeSelectById(supabase, 'product', contentId, '*')) ??
    null;

  const price =
    rawPrice ||
    n(contentItemRow?.price) ||
    n(contentItemRow?.price_krw) ||
    n(contentItemRow?.share_price_krw) ||
    n(contentItemRow?.last_price_krw) ||
    n(productRow?.price) ||
    n(productRow?.price_krw) ||
    n(productRow?.share_price_krw) ||
    n(productRow?.last_price_krw) ||
    12300;

  const qty = rawQty || (rawAmount > 0 ? Math.max(1, Math.floor(rawAmount / Math.max(1, price))) : 1);
  const amount = rawAmount || qty * price;

  const cols = await getColumns(supabase);
  const colSet = new Set<string>((cols ?? []).map((c) => c.column_name));

  const payload: Record<string, unknown> = {};
  const side = 'BUY';
  const status = DEMO_TRADING ? 'FILLED' : 'PENDING';

  setIf(colSet, payload, ['user_id', 'buyer_id', 'account_id', 'owner_id'], user.id);

  setIf(colSet, payload, ['content_id', 'content_item_id', 'item_id', 'asset_id'], contentId);

  if (colSet.has('product_id')) {
    const fkTarget = await getProductIdFkTarget(supabase);
    const targetTable = fkTarget?.table ?? 'products';

    let resolvedProductId: string | null = null;

    if (bodyProductId) resolvedProductId = bodyProductId;

    if (!resolvedProductId) {
      resolvedProductId =
        (contentItemRow?.product_id as string) ??
        (contentItemRow?.productId as string) ??
        null;
    }

    if (!resolvedProductId) {
      const check = await safeSelectById(supabase, targetTable, contentId, 'id');
      if (check?.id) resolvedProductId = String(check.id);
    }

    if (!resolvedProductId) {
      const first = await safeSelectFirst(supabase, targetTable, 'id');
      if (first?.id) resolvedProductId = String(first.id);
    }

    payload.product_id = resolvedProductId;
  }

  setIf(colSet, payload, ['side', 'order_side', 'direction'], side);
  if (colSet.has('order_type')) payload.order_type = 'BUY';

  const hasSideCol = colSet.has('side') || colSet.has('order_side') || colSet.has('direction') || colSet.has('order_type');
  if (colSet.has('type')) payload.type = hasSideCol ? 'LIMIT' : 'BUY';
  setIf(colSet, payload, ['order_kind', 'kind'], 'LIMIT');
  setIf(colSet, payload, ['status', 'order_status'], status);

  setIf(colSet, payload, ['price', 'limit_price', 'order_price', 'unit_price', 'price_krw'], price);
  setIf(colSet, payload, ['quantity', 'qty', 'shares', 'units'], qty);

  setIf(colSet, payload, ['amount', 'total_amount', 'total', 'notional'], amount);

  if (colSet.has('created_at')) payload.created_at = nowIso();
  if (colSet.has('updated_at')) payload.updated_at = nowIso();

  if (cols && cols.length > 0) {
    const required = cols
      .filter((c) => (c.is_nullable ?? '') === 'NO' && !c.column_default && (c.is_identity ?? 'NO') !== 'YES')
      .map((c) => c.column_name);

    const ctx: Record<string, unknown> = { side, status, orderType: 'BUY', kind: 'LIMIT', price, qty, amount };

    for (const c of required) {
      if (payload[c] === undefined && !BANNED_ORDER_COLS.has(c)) {
        const meta = cols.find((x) => x.column_name === c);
        const dv = guessDefaultForColumn(c, meta, ctx);
        if (dv !== undefined) payload[c] = dv;
      }
    }
  }

  for (const k of Object.keys(payload)) {
    if (BANNED_ORDER_COLS.has(k)) delete payload[k];
  }

  if (colSet.has('product_id') && !payload.product_id) {
    const fkTarget = await getProductIdFkTarget(supabase);
    return NextResponse.json(
      {
        ok: false,
        error: 'ORDER_CREATE_FAILED | msg=product_id unresolved (orders.product_id is NOT NULL)',
        debug: {
          contentId,
          bodyProductId: bodyProductId || null,
          contentItemProductId: contentItemRow?.product_id ?? contentItemRow?.productId ?? null,
          triedTargetTable: fkTarget?.table ?? 'products',
        },
      },
      { status: 400 }
    );
  }

  const { data: inserted, error: insErr } = await supabase.from('orders').insert(payload).select('*').limit(1);

  if (insErr) {
    return NextResponse.json(
      {
        ok: false,
        error: toErrString('ORDER_CREATE_FAILED', insErr),
        detail: pickError(insErr),
        debug: { demo: DEMO_TRADING, contentId, price, qty, amount, payload_keys: Object.keys(payload) },
      },
      { status: 400 }
    );
  }

  const order = Array.isArray(inserted) ? inserted[0] : inserted;
  return NextResponse.json({
    ok: true,
    demo: DEMO_TRADING,
    order_id: (order as Record<string, unknown>)?.id ?? null,
    order,
  });
}
