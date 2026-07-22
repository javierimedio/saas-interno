import { describe, expect, it } from 'vitest'

import { isActionOverdue } from '@/features/actions/domain/action.rules'

describe('isActionOverdue', () => {
  const now = new Date('2026-07-22T00:00:00Z')

  it('es true si la fecha límite ya pasó y no está cerrada', () => {
    expect(isActionOverdue('2026-07-20', 'pending', now)).toBe(true)
    expect(isActionOverdue('2026-07-20', 'in_progress', now)).toBe(true)
    expect(isActionOverdue('2026-07-20', 'blocked', now)).toBe(true)
  })

  it('es false sin fecha límite', () => {
    expect(isActionOverdue(null, 'pending', now)).toBe(false)
  })

  it('es false si ya está completada o cancelada', () => {
    expect(isActionOverdue('2026-07-20', 'completed', now)).toBe(false)
    expect(isActionOverdue('2026-07-20', 'cancelled', now)).toBe(false)
  })

  it('es false si la fecha límite todavía no ha llegado', () => {
    expect(isActionOverdue('2026-07-25', 'pending', now)).toBe(false)
  })
})
