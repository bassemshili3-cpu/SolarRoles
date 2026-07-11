// lib/jobHeaderImage.ts
import { unstable_cache } from 'next/cache'

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

type PexelsPhoto = {
  src: {
    landscape: string
  }
}

type PexelsSearchResponse = {
  photos: PexelsPhoto[]
}

async function fetchJobHeaderImage(query: string): Promise<string | null> {
  if (!PEXELS_API_KEY) return null

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        `${query} professional`
      )}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_API_KEY } }
    )

    if (!res.ok) return null

    const data: PexelsSearchResponse = await res.json()
    return data.photos?.[0]?.src?.landscape ?? null
  } catch (error) {
    console.error('Pexels API error:', error)
    return null
  }
}

// Cache par catégorie de métier (30 jours) : une illustration n'a pas besoin
// d'être fraîche, et ça évite de spammer Pexels pour les mêmes ~100 rôles
// qui reviennent en boucle sur toutes les job pages.
export const getJobHeaderImage = unstable_cache(
  fetchJobHeaderImage,
  ['job-header-image'],
  { revalidate: 60 * 60 * 24 * 30 }
)