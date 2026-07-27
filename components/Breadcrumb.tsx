import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { BreadcrumbSegment } from '@/lib/buildBreadcrumbSchema'

export default function Breadcrumb({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              {seg.url && !isLast ? (
                <Link href={seg.url} className="hover:text-foreground hover:underline">
                  {seg.name}
                </Link>
              ) : (
                <span className={isLast ? 'text-foreground font-medium truncate max-w-[240px]' : ''}>
                  {seg.name}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}