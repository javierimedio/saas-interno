'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { TIME_OFF_TYPE_LABELS } from '../domain/time-off.schema'
import { deleteTimeOffAction } from '../application/delete-time-off.action'
import { deleteHolidayAction } from '../application/delete-holiday.action'
import type { TimeOffRow } from '../infrastructure/time-off.repository'
import type { HolidayRow } from '../infrastructure/holidays.repository'

export function PeriodEventsPanel({
  timeOff,
  holidays,
  peopleNamesById,
}: {
  timeOff: TimeOffRow[]
  holidays: HolidayRow[]
  peopleNamesById: Map<string, string>
}) {
  const router = useRouter()

  async function handleDeleteTimeOff(id: string) {
    if (!window.confirm('¿Eliminar esta ausencia?')) return
    const result = await deleteTimeOffAction(id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  async function handleDeleteHoliday(id: string) {
    if (!window.confirm('¿Eliminar este festivo?')) return
    const result = await deleteHolidayAction(id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  if (timeOff.length === 0 && holidays.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {holidays.length > 0 ? (
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">Festivos del periodo</p>
          <ul className="flex flex-col gap-1.5">
            {holidays.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {new Date(`${h.date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {h.name}
                </span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteHoliday(h.id)}>
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {timeOff.length > 0 ? (
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">Ausencias del periodo</p>
          <ul className="flex flex-col gap-1.5">
            {timeOff.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {peopleNamesById.get(t.person_id) ?? '—'} · {TIME_OFF_TYPE_LABELS[t.type]} ·{' '}
                  {new Date(`${t.start_date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}–
                  {new Date(`${t.end_date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTimeOff(t.id)}>
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
