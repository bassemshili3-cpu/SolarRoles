// lib/classifyJob.ts

const FIFO_INCLUDE = [
  'fly in fly out', 'fly-in fly-out', 'fly in, fly out', 'fly-in, fly-out',
  'fly-in/fly-out', 'fly in / fly out', 'fifo roster', 'fifo rotation',
  'fifo schedule', 'fifo mining', 'fifo camp', 'fifo work camp',
  'fifo position', 'fifo employment', 'point of hire',
  'drive in drive out', 'drive-in drive-out', 'dido roster', 'dido rotation',
  'bus in bus out', 'bus-in bus-out', 'bibo roster',
  'crew change', '2/1 roster', '4/1 roster', '8/6 roster', '14/7 roster',
  'work camp accommodation',
]

const FIFO_EXCLUDE = [
  'fifo method', 'fifo basis', 'fifo system', 'fifo inventory',
  'first in, first out', 'first-in, first-out',
  'stock rotation', 'inventory rotation', 'perishable', 'shelf life',
  'expiration date', 'build-to',
]

const ROTATIONAL_TERMS = ['rotational', 'rotation']

const INDUSTRY_TERMS = [
  'mining', 'offshore', 'oil rig', 'oil field', 'gas field', 'drilling',
  'lng', 'refinery', 'roughneck', 'roustabout', 'derrick', 'boilermaker',
  'pipeline', 'remote site', 'work camp', 'man camp', 'wellsite',
  'well site', 'onshore rig',
]

const ROTATIONAL_EXCLUDE = [
  'rotational program', 'graduate rotational program', 'rotational internship',
  'management trainee', 'clinical rotation', 'clinical rotations',
  'medical rotation', 'nursing rotation', 'residency rotation',
]

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((t) => text.includes(t))
}

export function isFifoJob(title: string, description: string | null): boolean {
  const text = `${title} ${description ?? ''}`.toLowerCase()

  if (includesAny(text, FIFO_EXCLUDE)) return false

  if (includesAny(text, FIFO_INCLUDE)) return true

  const hasRotational = includesAny(text, ROTATIONAL_TERMS)
  const hasIndustry = includesAny(text, INDUSTRY_TERMS)
  if (hasRotational && hasIndustry && !includesAny(text, ROTATIONAL_EXCLUDE)) {
    return true
  }

  return false
}