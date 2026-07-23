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
 *
 * Comparte el mismo carbón de marca que la topbar (bg-brand-chrome) para leerse como una
 * única superficie en "L", no como un panel aparte — es la pieza que "integra" el sidebar
 * con la cabecera que pedía el rediseño.
 */
const ADMIN_NAV_ITEMS = [
  { href: '/hoy', label: 'Inicio', icon: LayoutGrid },
  { href: '/people', label: 'Personas', icon: Users },
  { href: '/one-on-ones', label: 'One2One', icon: Video },
  { href: '/actions', label: 'Acciones', icon: CheckSquare },
  { href: '/development', label: 'Desarrollo', icon: TrendingUp },
  { href: '/calendar', label: 'Calendario', icon: CalendarDays },
  { href: '/reports', label: 'Informes', icon: FileText },
  { href: '/import', label: 'Importar', icon: Upload },
] as const

function NavLink({ href, label, Icon, isActive }: { href: string; label: string; Icon: React.ElementType; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-md py-2 pr-2.5 pl-3.5 text-[13px] font-semibold text-white/65 transition-colors hover:bg-white/8 hover:text-white',
        isActive && 'bg-white/10 text-white',
      )}
    >
      <span
        className={cn(
          'absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-full bg-warning transition-opacity',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden
      />
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

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
    <aside className="flex h-full w-56 shrink-0 flex-col gap-0.5 bg-brand-chrome px-2.5 py-4">
      <nav className="flex flex-col gap-0.5" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} isActive={pathname.startsWith(item.href)} />
        ))}
      </nav>
      {isAdmin ? (
        <div className="mt-auto border-t border-white/10 pt-2">
          <NavLink href="/settings" label="Configuración" Icon={Settings} isActive={pathname.startsWith('/settings')} />
        </div>
      ) : null}
    </aside>
  )
}
