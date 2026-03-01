import { searchJobs } from '@/lib/adzuna'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic' // 👈 ajoutez cette ligne
export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams)
    console.log('APP_ID:', process.env.ADZUNA_APP_ID ? 'OK' : 'UNDEFINED')
    console.log('APP_KEY:', process.env.ADZUNA_APP_KEY ? 'OK' : 'UNDEFINED')
    const data = await searchJobs(params)
    return Response.json(data)
  } catch (e) {
    console.error('API route error:', e)
    return Response.json({ results: [], count: 0 }, { status: 500 })
  }
}