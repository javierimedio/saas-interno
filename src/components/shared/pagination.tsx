import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function Pagination({
  page,
  pageSize,
  total,
  buildHref,
}: {
  page: number
  pageSize: number
  total: number
  buildHref: (page: number) => string
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-border px-1 pt-3 text-sm text-muted-foreground">
      <span>
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1">
        <PageLink href={buildHref(page - 1)} disabled={page <= 1} label="Anterior">
          <ChevronLeft className="size-4" />
        </PageLink>
        <span className="px-2 text-xs">
          Página {page} de {totalPages}
        </span>
        <PageLink href={buildHref(page + 1)} disabled={page >= totalPages} label="Siguiente">
          <ChevronRight className="size-4" />
        </PageLink>
      </div>
    </div>
  )
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'pointer-events-none opacity-40')}>
        {children}
        <span className="sr-only">{label}</span>
      </span>
    )
  }

  return (
    <Link href={href} className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label={label}>
      {children}
    </Link>
  )
}
