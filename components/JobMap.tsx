'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'

const Map = dynamic(() => import('./MapComponent'), { ssr: false })

export default function JobMap({ jobs }: { jobs: any[] }) {
  const [showMap, setShowMap] = useState(false)

  return (
    <div>
      <button
        onClick={() => setShowMap(!showMap)}
        className="mb-6 px-6 py-3 bg-primary text-white rounded-full font-medium flex items-center gap-2"
      >
        {showMap ? 'Hide Map' : '🗺️ View on Map (50 miles radius)'}
      </button>
      {showMap && <Map jobs={jobs} />}
    </div>
  )
}

// components/MapComponent.tsx (créé séparément)