// contexts/filter-drawer-context.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterDrawerContextType {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const FilterDrawerContext = createContext<FilterDrawerContextType | undefined>(undefined)

export function FilterDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <FilterDrawerContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(o => !o),
      }}
    >
      {children}
    </FilterDrawerContext.Provider>
  )
}

export function useFilterDrawer() {
  const ctx = useContext(FilterDrawerContext)
  if (!ctx) throw new Error('useFilterDrawer doit être utilisé dans un FilterDrawerProvider')
  return ctx
}