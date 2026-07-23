'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, Bell, Cake, CheckCheck, Clock, UserPlus, Users, Wallet } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AppNotification, NotificationType } from '../domain/notification.rules'

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  birthday: Cake,
  one_on_one_today: Users,
  one_on_one_tomorrow: Users,
  action_overdue: AlertTriangle,
  action_due_soon: Clock,
  future_hire: UserPlus,
  salary_review: Wallet,
}

const TONE: Record<NotificationType, string> = {
  birthday: 'text-accent-foreground',
  one_on_one_today: 'text-info',
  one_on_one_tomorrow: 'text-muted-foreground',
  action_overdue: 'text-destructive',
  action_due_soon: 'text-warning',
  future_hire: 'text-info',
  salary_review: 'text-warning',
}

function storageKey(userKey: string): string {
  return `nexo:notifications:read:${userKey}`
}

function loadRead(userKey: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(storageKey(userKey))
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveRead(userKey: string, read: Set<string>) {
  try {
    window.localStorage.setItem(storageKey(userKey), JSON.stringify([...read]))
  } catch {
    // Almacenamiento no disponible (modo privado, cuota...): el estado de leído simplemente no persiste.
  }
}

/**
 * Centro de notificaciones (MVP): las notificaciones se derivan en el servidor a partir de datos
 * ya existentes; el estado de "leída" se guarda en localStorage por usuario, sin tabla nueva.
 */
export function NotificationsBell({ notifications, userKey }: { notifications: AppNotification[]; userKey: string }) {
  const [readIds, setReadIds] = React.useState<Set<string>>(() => new Set())
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setReadIds(loadRead(userKey))
  }, [userKey])

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length

  function markAsRead(id: string) {
    setReadIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      saveRead(userKey, next)
      return next
    })
  }

  function markAllAsRead() {
    const next = new Set(notifications.map((n) => n.id))
    setReadIds(next)
    saveRead(userKey, next)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={unreadCount > 0 ? `Notificaciones (${unreadCount} sin leer)` : 'Notificaciones'}
        className="relative flex size-9 items-center justify-center rounded-md text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold leading-none text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Notificaciones</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-accent-foreground outline-none hover:underline"
            >
              <CheckCheck className="size-3.5" />
              Marcar todas
            </button>
          ) : null}
        </div>
        <div className="max-h-96 overflow-y-auto border-t border-border">
          {notifications.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No tienes notificaciones.</p>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = ICONS[n.type]
                const isRead = readIds.has(n.id)
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        markAsRead(n.id)
                        setOpen(false)
                      }}
                      className="flex items-start gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-secondary/50"
                    >
                      <Icon className={cn('mt-0.5 size-4 shrink-0', TONE[n.type])} />
                      <div className="min-w-0 flex-1">
                        <p className={cn('truncate font-semibold text-foreground', isRead && 'font-normal text-muted-foreground')}>
                          {n.title}
                        </p>
                        <p className="truncate text-[13px] text-muted-foreground">{n.description}</p>
                      </div>
                      {!isRead ? <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-foreground" aria-hidden /> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
