import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const id = rawId?.trim()

  if (!id) {
    return NextResponse.json({ error: 'INVALID_ID' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[market/item] supabase error:', error.message)
    }
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  if (!data) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({ item: data })
}
