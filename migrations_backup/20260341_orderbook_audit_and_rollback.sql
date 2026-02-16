#!/usr/bin/env node
/**
 * DAY4~5: 대량 동시 주문 스트레스 테스트
 * - 50개 가상 주문 생성 (bid/ask 혼합, 랜덤 price_usd)
 * - 동시에 rpc_match_orders 호출
 * - 중복 체결 없는지 확인 (trades unique, ledger 불일치 없음)
 *
 * 환경변수: SMOKE_ITEM_ID, SMOKE_USER_1, SMOKE_USER_2 (또는 기본값)
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const admin = createClient(url, key);

const ITEM_ID = process.env.SMOKE_ITEM_ID || '00000000-0000-0000-0000-000000000001';
const USER_1 = process.env.SMOKE_USER_1 || '00000000-0000-0000-0000-000000000002';
const USER_2 = process.env.SMOKE_USER_2 || '00000000-0000-0000-0000-000000000003';
const ORDER_COUNT = 50;

function randomPrice(min = 9.5, max = 10.5) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

async function placeOrder(userId, side, priceUsd, quantity) {
  const { data, error } = await admin.rpc('rpc_place_orderbook_order', {
    p_user_id: userId,
    p_item_id: ITEM_ID,
    p_side: side,
    p_price_usd: priceUsd,
    p_quantity: quantity,
    p_price_krw: Math.round(priceUsd * 1350),
  });
  if (error) throw error;
  return data;
}

async function main() {
  console.log('=== Stress Orderbook Test ===');
  console.log('item_id:', ITEM_ID);
  console.log('users:', USER_1, USER_2);
  console.log('orders:', ORDER_COUNT);

  // 1) 사전: 두 유저에 sim deposit (시뮬레이션 모드)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const depositRes = await fetch(`${baseUrl}/api/sim/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (depositRes.ok) {
      console.log('sim deposit (현재 세션) OK');
    }
  } catch (e) {
    console.log('sim deposit skip (서버 미실행 또는 비시뮬레이션):', e?.message);
  }

  // 2) 기존 trades/ledger 카운트
  const { count: tradesBefore } = await admin.from('trades').select('*', { count: 'exact', head: true }).eq('content_id', ITEM_ID);
  const { data: ledgerBefore } = await admin.from('ledger_entries').select('id').or('memo.eq.TRADE_BUY,memo.eq.TRADE_SELL');
  const ledgerCountBefore = ledgerBefore?.length ?? 0;
  console.log('trades before:', tradesBefore ?? 0, 'ledger TRADE_* before:', ledgerCountBefore);

  // 3) 50개 주문 생성 (service_role로 rpc 호출 - auth.uid() 체크 있음)
  // rpc_place_orderbook_order은 auth.uid() = p_user_id 검사 → service_role은 auth.uid() null
  // 따라서 API를 통해 주문해야 함. 스크립트에서는 직접 rpc 호출 불가.
  // 대안: service_role로 orderbook_orders에 직접 INSERT? → 트리거로 set_config 필요
  // 대안: 두 유저로 signIn 후 각각 API 호출
  // 간단화: admin.rpc는 SECURITY DEFINER로 실행되므로 auth.uid()가 RPC 내부에서 어떻게 되는지 확인
  // Supabase service_role 클라이언트로 rpc 호출 시, JWT에 user가 없으면 auth.uid() = null
  // 그래서 FORBIDDEN 발생. 따라서 스크립트에서:
  // A) 두 유저의 세션 토큰을 얻어서 각각 클라이언트 생성 후 주문
  // B) 또는 DB에서 set_config를 설정하는 방식으로 우회 (복잡)
  // C) 또는 rpc_sim_deposit으로 먼저 충전 후, 별도 스크립트로 브라우저/API 테스트

  // 실제로 run-trade-atomicity-smoke는 rpc_match_orders만 호출 (auth 불필요)
  // 주문은 이미 있다고 가정. 우리는 "50개 주문 생성"이 필요.
  // Supabase Admin API로 임시로 auth bypass할 수 있는지? admin.auth.admin.generateLink 등으로
  // 사용자 링크 생성 후 해당 세션으로 요청? 복잡함.

  // 실용적 접근: 스크립트가 /api/orders/orderbook/place를 여러 번 호출하려면
  // 인증된 세션이 필요. 스크립트에서 signInWithPassword로 로그인 후
  // fetch로 API 호출. 하지만 두 유저가 필요하므로 두 번 로그인/호출.
  // 또는 한 유저로 25 bid + 25 ask? 같은 유저가 bid와 ask 동시에 넣을 수 있음.

  // 더 간단: SQL로 직접 orderbook_orders INSERT (set_config + audit 포함 RPC 사용)
  // rpc_sim_place_order 같은 RPC를 만들거나...
  // 기존 rpc_place_orderbook_order을 service_role에서 auth bypass로 호출할 수 있으면 좋은데.

  // 문서를 다시 읽음: "50개 가상 주문 생성" - 가상이므로 시뮬레이션용.
  // rpc_place_orderbook_order은 auth.uid() = p_user_id 체크. service_role + anon key
  // 없이 호출하면 실패. 
  // 해결: rpc_sim_place_orderbook_order 같은 시뮬레이션 전용 RPC를 만들자.
  // SIMULATION_MODE일 때만 service_role이 호출 가능, auth 체크 스킵.

  // 또는: 스크립트가 LOGIN_EMAIL, LOGIN_PASSWORD로 로그인해서 API 호출.
  // run-partial-sell-test처럼. 그럼 50번 API 호출을 해야 함.
  // 25 bid (user1) + 25 ask (user2) - 두 계정 필요.

  // 가장 단순: rpc_sim_place_orderbook_order(p_user_id, p_item_id, p_side, p_price_usd, p_quantity)
  // 시뮬레이션 모드에서만 service_role이 호출 가능, auth.uid() 체크 스킵.
  // 이걸 마이그레이션에 추가하고, 스크립트에서 admin.rpc로 50번 호출.

  // 일단 rpc_sim_place_orderbook_order을 추가하고 스크립트를 완성하자.
  // 아, 기존 rpc_place_orderbook_order을 수정하면 다른 코드에 영향. 새 RPC 추가.
</think>

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read