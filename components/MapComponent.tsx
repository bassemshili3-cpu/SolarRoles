'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { LatLngExpression } from 'leaflet'
import { useEffect, useState } from 'react'

// Fix icône Leaflet cassée en Next.js
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


export default function MapComponent({ jobs }: any) {
  const center: LatLngExpression = [39.8283, -98.5795]
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <MapContainer key="map" center={center} zoom={4} className="leaflet-container">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {jobs.slice(0, 50).map((job: any) => {
        const lat = job.latitude || 40
        const lon = job.longitude || -100
        return (
          <Marker key={job.id} position={[lat, lon]}>
            <Popup>
              <strong>{job.title}</strong><br />
              {job.company.display_name}<br />
              ${job.salary_min?.toLocaleString() || 'N/A'}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}