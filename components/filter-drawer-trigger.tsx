// components/filter-drawer-trigger.tsx
'use client'

import { Settings } from 'lucide-react'
import { useFilterDrawer } from '@/contexts/filter-drawer-context'

export function FilterDrawerTrigger() {
  const { toggle } = useFilterDrawer()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ouvrir les filtres"
      className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors text-foreground"
    >
      <Settings className="h-5 w-5" />
    </button>
  )
}