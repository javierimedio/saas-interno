import Image from 'next/image'
import { Bell, LogOut } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BRAND } from '@/lib/brand'
import { signOutAction } from '@/features/auth/application/sign-in.action'
import { ThemeToggle } from './theme-toggle'

export function Topbar({ organizationName, email }: { organizationName: string; email: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3.5 bg-brand-chrome px-5 text-brand-chrome-foreground">
      <Image src={BRAND.logoWhiteUrl} alt={BRAND.name} width={140} height={28} className="h-7 w-auto object-contain" priority />
      <span className="h-5 w-px bg-white/25" aria-hidden />
      <span className="text-[13px] font-bold tracking-wide text-white uppercase">Nexo</span>
      <span className="hidden h-4 w-px bg-white/20 sm:inline" aria-hidden />
      <div className="hidden items-center gap-3 sm:flex">
        {BRAND.partnerBrands.map((brand) => (
          <Image
            key={brand.name}
            src={brand.logoUrl}
            alt={brand.name}
            width={90}
            height={14}
            className="h-3.5 w-auto object-contain opacity-50 brightness-0 invert transition-opacity hover:opacity-90"
          />
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <span className="mr-2 hidden text-[12px] text-white/60 md:inline">{organizationName}</span>
        <ThemeToggle onDark />
        <button
          type="button"
          disabled
          aria-label="Notificaciones (próximamente)"
          title="Notificaciones — próximamente"
          className="relative flex size-9 cursor-not-allowed items-center justify-center rounded-md text-white/40 outline-none"
        >
          <Bell className="size-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex items-center gap-2 rounded-md px-1.5 py-1 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/40">
            <Avatar name={email} size="sm" className="bg-white/15 text-white" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="flex w-full items-center gap-2 text-left">
                  <LogOut className="size-4" />
                  Cerrar sesión
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
