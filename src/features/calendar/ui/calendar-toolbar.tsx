'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { shiftDate, type CalendarView } from '../domain/calendar.rules'

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
]

function toParam(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function CalendarToolbar({ view, date, title }: { view: CalendarView; date: Date; title: string }) {
  const prev = shiftDate(view, date, -1)
  const next = shiftDate(view, date, 1)

  function href(v: CalendarView, d: Date) {
    return `/calendar?view=${v}&date=${toParam(d)}`
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <Link href={href(view, prev)} className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Anterior">
          <ChevronLeft className="size-4" />
        </Link>
        <Link href={href(view, next)} className={buttonVariants({ variant: 'ghost', size: 'icon' })} aria-label="Siguiente">
          <ChevronRight className="size-4" />
        </Link>
        <Link href={href(view, new Date())} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          Hoy
        </Link>
        <span className="ml-2 text-sm font-semibold">{title}</span>
      </div>

      <div className="inline-flex rounded-md border border-input p-0.5">
        {VIEWS.map((v) => (
          <Link
            key={v.value}
            href={href(v.value, date)}
            className={cn(
              'rounded px-3 py-1 text-xs font-semibold',
              v.value === view ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
            )}
          >
            {v.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
