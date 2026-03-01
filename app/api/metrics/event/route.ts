import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase()
    const body = await req.json()

    const { type, user_id, amount } = body

    if (!type) {
      return NextResponse.json({ ok: false, error: 'type required' })
    }

    await supabase.from('metrics_events').insert({
      type,
      user_id: user_id ?? null,
      amount: amount ?? null
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({
      ok: true,
      note: 'event-insert-error',
      error: e?.message ?? 'unknown'
    })
  }
}
