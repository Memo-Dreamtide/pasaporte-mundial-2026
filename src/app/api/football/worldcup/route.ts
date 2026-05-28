import { NextResponse } from 'next/server'

// Vercel Cron (every 1 min) → triggers Supabase Edge Function
// Edge Function does the heavy lifting: 4 polls × 15s = real-time scores
const EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-matches`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Auth check
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Call Edge Function with the same secret
    const response = await fetch(
      `${EDGE_FUNCTION_URL}?secret=${process.env.CRON_SECRET}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const data = await response.json()

    return NextResponse.json({
      source: 'vercel-cron-proxy',
      edge_function_status: response.status,
      ...data,
    })
  } catch (error) {
    console.error('Edge Function call failed:', error)
    return NextResponse.json({
      success: false,
      source: 'vercel-cron-proxy',
      error: error instanceof Error ? error.message : 'Edge Function unreachable',
    }, { status: 502 })
  }
}
