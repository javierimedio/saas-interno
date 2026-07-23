'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutGrid,
  Settings,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Navegación principal (docs/product-design/06-navigation.md §6.2). Solo "Personas" está
 * implementado en esta iteración; el resto se muestra deshabilitado con la etiqueta
 * "Pronto" para no ocultar la visión completa del producto ni ofrecer enlaces rotos.
 */
const NAV_ITEMS = [
  { href: '/hoy', label: 'Hoy', icon: LayoutGrid, enabled: true },
  { href: '/people', label: 'Personas', icon: Users, enabled: true },
  { href: '/one-on-ones', label: 'One2One', icon: Video, enabled: true },
  { href: '/actions', label: 'Acciones', icon: CheckSquare, enabled: true },
  { href: '/development', label: 'Desarrollo', icon: TrendingUp, enabled: true },
  { href: '/calendar', label: 'Calendario', icon: CalendarDays, enabled: true },
  { href: '/reports', label: 'Informes', icon: FileText, enabled: false },
] as const

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card px-3 py-4">
      <div className="flex items-center gap-2 px-2 pb-4 text-sm font-semibold">
        <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden />
        Nexo
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.enabled && pathname.startsWith(item.href)

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/50"
                aria-disabled
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Pronto
                </span>
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                isActive && 'bg-accent text-accent-foreground hover:bg-accent',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto border-t border-border pt-2">
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground/50" aria-disabled>
          <Settings className="size-4" />
          <span className="flex-1">Ajustes</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            Pronto
          </span>
        </div>
      </div>
    </aside>
  )
}
