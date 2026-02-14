import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const { count: last_1h_count } = await supabase
      .from('metrics_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString())

    const { data: amountRows } = await supabase
      .from('metrics_events')
      .select('amount')
      .gte('created_at', oneDayAgo.toISOString())

    const last_24h_amount =
      amountRows?.reduce((sum, r) => sum + Number(r.amount || 0), 0) ?? 0

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count: today_count } = await supabase
      .from('metrics_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString())

    return NextResponse.json({
      ok: true,
      live: last_1h_count ?? 0,
      last_24h_amount,
      last_1h_count: last_1h_count ?? 0,
      today_count: today_count ?? 0
    })
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message ?? 'live-error'
    })
  }
}
