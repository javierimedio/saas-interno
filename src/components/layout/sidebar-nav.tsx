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
  Upload,
  User,
  Users,
  Video,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Navegación principal (docs/product-design/06-navigation.md §6.2). Modelo de dos roles:
 * admin ve la navegación completa de gestión; employee solo ve su propia ficha, que ya
 * reúne su One2One, sus acciones, su desarrollo, su compensación y sus documentos en un
 * único sitio (docs/03-modelo-datos.md §3.10: RLS ya restringe el acceso a nivel de datos,
 * este nav solo evita ofrecer enlaces a pantallas de gestión vacías o rotas).
 */
const ADMIN_NAV_ITEMS = [
  { href: '/hoy', label: 'Dashboard', icon: LayoutGrid },
  { href: '/people', label: 'Personas', icon: Users },
  { href: '/one-on-ones', label: 'One2One', icon: Video },
  { href: '/actions', label: 'Acciones', icon: CheckSquare },
  { href: '/development', label: 'Desarrollo', icon: TrendingUp },
  { href: '/calendar', label: 'Calendario', icon: CalendarDays },
  { href: '/reports', label: 'Informes', icon: FileText },
  { href: '/import', label: 'Importar', icon: Upload },
] as const

export function SidebarNav({
  role,
  personId,
}: {
  role: 'admin' | 'manager' | 'employee'
  personId: string | null
}) {
  const pathname = usePathname()
  const isAdmin = role === 'admin'
  const navItems = isAdmin
    ? ADMIN_NAV_ITEMS
    : personId
      ? ([{ href: `/people/${personId}`, label: 'Mi ficha', icon: User }] as const)
      : []

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card px-3 py-4">
      <div className="flex items-center gap-2 px-2 pb-4 text-sm font-semibold">
        <span className="h-2 w-2 rounded-sm bg-primary" aria-hidden />
        Nexo
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Navegación principal">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

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
      {isAdmin ? (
        <div className="mt-auto border-t border-border pt-2">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
              pathname.startsWith('/settings') && 'bg-accent text-accent-foreground hover:bg-accent',
            )}
          >
            <Settings className="size-4" />
            Ajustes
          </Link>
        </div>
      ) : null}
    </aside>
  )
}
