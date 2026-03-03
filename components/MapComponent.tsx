'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

// Import Leaflet CSS - IMPORTANT pour Next.js
import 'leaflet/dist/leaflet.css'

// Fix icône Leaflet cassée en Next.js
import L from 'leaflet'

// Nettoyer le cache d'icône précédente
delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Centre des USA
const CENTER: [number, number] = [39.8283, -98.5795]

export default function MapComponent({ jobs }: { jobs?: any[] }) {
  const [mounted, setMounted] = useState(false)
  const [mapJobs, setMapJobs] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter valid jobs with coordinates
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const validJobs = jobs
        .filter((job: any) => job.latitude && job.longitude)
        .slice(0, 50) // Limit markers
      setMapJobs(validJobs)
    }
  }, [jobs])

  // Ne pas rendre pendant le SSR
  if (!mounted) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  // Pas de jobs avec coordonnées
  if (mapJobs.length === 0) {
    return (
      <div className="h-[400px] bg-gray-100 rounded-xl flex items-center justify-center mb-8">
        <p className="text-gray-500">No location data available</p>
      </div>
    )
  }

  return (
    <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={CENTER}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapJobs.map((job: any) => (
          <Marker
            key={job.id}
            position={[job.latitude, job.longitude]}
          >
            <Popup>
              <div className="text-sm">
                <strong className="block mb-1">{job.title}</strong>
                <span className="text-gray-600">
                  {job.company?.display_name || job.company || 'Company'}
                </span>
                {job.salary_min && (
                  <span className="block text-green-600 mt-1">
                    ${job.salary_min.toLocaleString()}
                  </span>
                )}
                {job.location?.display_name && (
                  <span className="block text-gray-500 text-xs mt-1">
                    {job.location.display_name}
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}