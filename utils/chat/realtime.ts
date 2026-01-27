import { supabase } from '@/lib/supabase/client';
// utils/chat/realtime.ts
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

const channelMap = new Map<string, RealtimeChannel>();

export function subscribeChat(
  supabase: SupabaseClient,
  roomKey: string,
  onInsert: (payload: any) => void
) {
  // 이미 구독 중이면 재사용
  if (channelMap.has(roomKey)) {
    return channelMap.get(roomKey)!;
  }

  const channel = supabase
    .channel(`chat:${roomKey}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_key=eq.${roomKey}`,
      },
      onInsert
    )
    .subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        // 소음 방지: 콘솔 로그 최소화
      }
    });

  channelMap.set(roomKey, channel);
  return channel;
}

export function unsubscribeChat(
  supabase: SupabaseClient,
  roomKey: string
) {
  const channel = channelMap.get(roomKey);
  if (!channel) return;

  supabase.removeChannel(channel);
  channelMap.delete(roomKey);
}

