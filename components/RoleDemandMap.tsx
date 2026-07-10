'use client'

import { useId, useState } from 'react'
import { US_STATE_PATHS } from '@/lib/data/us-states-paths'
import type { StateDemand } from '@/lib/roleDemandByState'

interface RoleDemandMapProps {
  data: StateDemand[]
  roleLabel: string
}

type HoverInfo = { name: string; count: number; x: number; y: number }

function getColor(count: number, max: number): string {
  if (count === 0 || max === 0) return '#f1f5f9' // slate-100 : pas de donnée
  const ratio = count / max
  if (ratio > 0.75) return '#1d4ed8' // blue-700
  if (ratio > 0.5) return '#3b82f6'  // blue-500
  if (ratio > 0.25) return '#60a5fa' // blue-400
  return '#93c5fd'                   // blue-300
}

const LEGEND = [
  { label: 'None',      color: '#f1f5f9' },
  { label: 'Low',       color: '#93c5fd' },
  { label: 'Medium',    color: '#60a5fa' },
  { label: 'High',      color: '#3b82f6' },
  { label: 'Very high', color: '#1d4ed8' },
]

function stateName(abbr: string): string {
  return US_STATE_PATHS[abbr]?.name ?? abbr
}

export default function RoleDemandMap({ data, roleLabel }: RoleDemandMapProps) {
  const [hovered, setHovered] = useState<HoverInfo | null>(null)
  const titleId = useId()
  const descId = useId()

  const countByState = new Map(data.map((d) => [d.state, d.count]))
  const max = data.reduce((m, d) => Math.max(m, d.count), 0)

  // Pas de données exploitables : mieux vaut ne rien afficher qu'une carte
  // entièrement grise qui laisserait croire à une absence réelle d'offres.
  if (max === 0) return null

  // Classement des états avec au moins une offre, du plus au moins actif —
  // sert à la fois à la description accessible du SVG et au tableau structuré.
  const ranked = [...data]
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)

  const top = ranked[0]
  const bottom = ranked[ranked.length - 1]

  const svgDescription =
    top && bottom && top.state !== bottom.state
      ? `Choropleth map of ${roleLabel} job openings across US states, based on active listings in our database. ${stateName(top.state)} has the most open positions (${top.count.toLocaleString('en-US')}), while ${stateName(bottom.state)} has the fewest among states with active listings (${bottom.count.toLocaleString('en-US')}).`
      : `Choropleth map of ${roleLabel} job openings across US states, based on active listings in our database.`

  const handleMove = (name: string, count: number, e: React.MouseEvent<SVGPathElement>) => {
    const svg = e.currentTarget.ownerSVGElement
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    setHovered({
      name,
      count,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <figure className="mt-8 rounded-xl border p-5 m-0">
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Where {roleLabel} jobs are hiring right now
      </h3>
      <figcaption className="text-xs text-muted-foreground mb-4">
        Based on active listings in our database, by state. Hover a state for its exact count.
      </figcaption>

      <div className="relative">
        <svg
          viewBox="0 0 960 600"
          className="w-full h-auto select-none"
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
          <title id={titleId}>{roleLabel} job openings by US state</title>
          <desc id={descId}>{svgDescription}</desc>

          {Object.entries(US_STATE_PATHS).map(([abbr, { name, d }]) => {
            const count = countByState.get(abbr) || 0
            return (
              <path
                key={abbr}
                d={d}
                fill={getColor(count, max)}
                stroke="white"
                strokeWidth={0.75}
                onMouseMove={(e) => handleMove(name, count, e)}
                onMouseLeave={() => setHovered(null)}
                className="transition-opacity duration-150 hover:opacity-75 cursor-default"
              />
            )
          })}
        </svg>

        {hovered && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg bg-slate-900 text-white text-xs px-2.5 py-1.5 shadow-lg whitespace-nowrap"
            style={{
              left: hovered.x,
              top: hovered.y - 12,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <span className="font-semibold">{hovered.name}</span>
            {' — '}
            {hovered.count.toLocaleString('en-US')} open position{hovered.count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm inline-block border border-slate-200"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {/*
        Données structurées équivalentes, en texte réel plutôt qu'encodées
        uniquement dans des teintes de couleur SVG. Invisible à l'écran
        (sr-only) mais lisible par les lecteurs d'écran ET par les crawlers/
        systèmes d'IA qui ne peuvent pas interpréter une couleur de remplissage
        comme une valeur numérique. C'est directement ce que vise la guideline
        Bing : l'image ne doit jamais être la seule source de l'information.
      */}
      <table className="sr-only">
        <caption>{roleLabel} open positions by state</caption>
        <thead>
          <tr>
            <th scope="col">State</th>
            <th scope="col">Open positions</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((d) => (
            <tr key={d.state}>
              <td>{stateName(d.state)}</td>
              <td>{d.count.toLocaleString('en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}