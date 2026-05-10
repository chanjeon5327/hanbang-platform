'use client';

/**
 * lib/supabase/browser.ts
 * utils/supabase/client.ts의 싱글톤으로 위임한다.
 * 두 개의 클라이언트 인스턴스가 존재하면 onAuthStateChange 이벤트가
 * 교차 전파되지 않으므로 반드시 단일 인스턴스를 공유해야 한다.
 */
export { getBrowserSupabase as getSupabaseBrowserClient } from '@/utils/supabase/client';
