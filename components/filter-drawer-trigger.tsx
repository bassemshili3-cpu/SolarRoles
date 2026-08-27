// components/filter-drawer-trigger.tsx
'use client'

import { SlidersHorizontal } from 'lucide-react'
import { useFilterDrawer } from '@/contexts/filter-drawer-context'

export function FilterDrawerTrigger() {
  const { toggle } = useFilterDrawer()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ouvrir les filtres"
      className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-accent transition-colors text-foreground"
    >
      <SlidersHorizontal className="h-6 w-6" strokeWidth={2.25} />
    </button>
  )
}
