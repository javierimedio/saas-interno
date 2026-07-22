import { describe, expect, it } from 'vitest'

import { getMonthGridDays, getRangeForView, getWeekDays, isSameDay, shiftDate } from '@/features/calendar/domain/calendar.rules'

describe('getMonthGridDays', () => {
  it('siempre devuelve semanas completas (múltiplo de 7)', () => {
    const days = getMonthGridDays(new Date('2026-07-15'))
    expect(days.length % 7).toBe(0)
  })

  it('incluye todos los días del mes', () => {
    const days = getMonthGridDays(new Date('2026-07-15'))
    const julyDays = days.filter((d) => d.getMonth() === 6 && d.getFullYear() === 2026)
    expect(julyDays).toHaveLength(31)
  })
})

describe('getWeekDays', () => {
  it('devuelve 7 días empezando en lunes', () => {
    const days = getWeekDays(new Date('2026-07-22')) // miércoles
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1) // lunes
  })
})

describe('getRangeForView', () => {
  it('el rango de día cubre desde las 00:00 hasta las 23:59', () => {
    const { start, end } = getRangeForView('day', new Date('2026-07-22T15:00:00'))
    expect(start.getHours()).toBe(0)
    expect(end.getHours()).toBe(23)
  })

  it('el rango de semana empieza en lunes y termina en domingo', () => {
    const { start, end } = getRangeForView('week', new Date('2026-07-22'))
    expect(start.getDay()).toBe(1)
    expect(end.getDay()).toBe(0)
  })
})

describe('shiftDate', () => {
  it('avanza un día en vista día', () => {
    const next = shiftDate('day', new Date('2026-07-22'), 1)
    expect(isSameDay(next, new Date('2026-07-23'))).toBe(true)
  })

  it('avanza un mes en vista mes', () => {
    const next = shiftDate('month', new Date('2026-07-22'), 1)
    expect(next.getMonth()).toBe(7) // agosto
  })
})
