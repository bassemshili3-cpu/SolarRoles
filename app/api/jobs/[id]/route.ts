import { NextRequest } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = `https://api.adzuna.com/v1/api/jobs/us/ads/${id}?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}`
  const res = await fetch(url)
  if (!res.ok) return Response.json({ error: 'Job not found' }, { status: 404 })
  return Response.json(await res.json())
}