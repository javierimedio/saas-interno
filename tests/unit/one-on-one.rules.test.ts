import { describe, expect, it } from 'vitest'

import { canTransition, isMeetingOverdue } from '@/features/one-on-ones/domain/one-on-one.rules'

describe('canTransition', () => {
  it('permite scheduled -> preparing -> in_progress -> completed', () => {
    expect(canTransition('scheduled', 'preparing')).toBe(true)
    expect(canTransition('preparing', 'in_progress')).toBe(true)
    expect(canTransition('in_progress', 'completed')).toBe(true)
  })

  it('permite saltar preparación (scheduled -> in_progress)', () => {
    expect(canTransition('scheduled', 'in_progress')).toBe(true)
  })

  it('permite cancelar desde cualquier estado activo', () => {
    expect(canTransition('scheduled', 'cancelled')).toBe(true)
    expect(canTransition('preparing', 'cancelled')).toBe(true)
    expect(canTransition('in_progress', 'cancelled')).toBe(true)
  })

  it('no permite transiciones desde completed ni cancelled', () => {
    expect(canTransition('completed', 'in_progress')).toBe(false)
    expect(canTransition('cancelled', 'scheduled')).toBe(false)
  })

  it('no permite retroceder de in_progress a preparing', () => {
    expect(canTransition('in_progress', 'preparing')).toBe(false)
  })

  it('no permite saltar directamente de scheduled a completed', () => {
    expect(canTransition('scheduled', 'completed')).toBe(false)
  })
})

describe('isMeetingOverdue', () => {
  it('es true si la fecha programada ya pasó y sigue scheduled', () => {
    expect(isMeetingOverdue('2026-01-01T10:00:00Z', 'scheduled', new Date('2026-01-02T10:00:00Z'))).toBe(true)
  })

  it('es false si todavía no ha llegado la fecha', () => {
    expect(isMeetingOverdue('2026-01-02T10:00:00Z', 'scheduled', new Date('2026-01-01T10:00:00Z'))).toBe(false)
  })

  it('es false si ya está completada o cancelada, aunque la fecha haya pasado', () => {
    expect(isMeetingOverdue('2026-01-01T10:00:00Z', 'completed', new Date('2026-01-02T10:00:00Z'))).toBe(false)
    expect(isMeetingOverdue('2026-01-01T10:00:00Z', 'cancelled', new Date('2026-01-02T10:00:00Z'))).toBe(false)
  })
})
