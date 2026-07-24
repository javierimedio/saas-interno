import { describe, expect, it } from 'vitest'

import {
  autoAdvanceBlockStatus,
  canTransition,
  findPreviousCompletedMeeting,
  isMeetingOverdue,
} from '@/features/one-on-ones/domain/one-on-one.rules'
import type { BlockData } from '@/features/one-on-ones/domain/one-on-one.schema'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'

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

describe('autoAdvanceBlockStatus', () => {
  it('pasa de pendiente a en edición en cuanto hay contenido en algún campo', () => {
    const block: BlockData = { status: 'pending', fields: { general_feeling: 'Bien' } }
    expect(autoAdvanceBlockStatus(block)).toBe('in_progress')
  })

  it('se mantiene pendiente si todos los campos están vacíos', () => {
    const block: BlockData = { status: 'pending', fields: { general_feeling: '   ' } }
    expect(autoAdvanceBlockStatus(block)).toBe('pending')
  })

  it('nunca avanza automáticamente a completado', () => {
    const block: BlockData = { status: 'in_progress', fields: { general_feeling: 'Bien' } }
    expect(autoAdvanceBlockStatus(block)).toBe('in_progress')
  })

  it('no retrocede un bloque ya completado', () => {
    const block: BlockData = { status: 'completed', fields: {} }
    expect(autoAdvanceBlockStatus(block)).toBe('completed')
  })
})

describe('findPreviousCompletedMeeting', () => {
  function meeting(id: string, status: OneOnOneRow['status'], scheduledAt: string): OneOnOneRow {
    return { id, status, scheduled_at: scheduledAt } as OneOnOneRow
  }

  it('devuelve la reunión completada más reciente anterior a la actual', () => {
    const meetings = [
      meeting('old', 'completed', '2026-01-01T10:00:00Z'),
      meeting('recent', 'completed', '2026-03-01T10:00:00Z'),
      meeting('current', 'in_progress', '2026-06-01T10:00:00Z'),
    ]
    expect(findPreviousCompletedMeeting(meetings, 'current', '2026-06-01T10:00:00Z')?.id).toBe('recent')
  })

  it('ignora reuniones no completadas y la propia reunión actual', () => {
    const meetings = [meeting('current', 'completed', '2026-03-01T10:00:00Z')]
    expect(findPreviousCompletedMeeting(meetings, 'current', '2026-03-01T10:00:00Z')).toBeUndefined()
  })

  it('ignora reuniones completadas posteriores a la fecha actual', () => {
    const meetings = [meeting('future', 'completed', '2026-12-01T10:00:00Z')]
    expect(findPreviousCompletedMeeting(meetings, 'current', '2026-06-01T10:00:00Z')).toBeUndefined()
  })

  it('devuelve undefined si no hay ninguna reunión completada previa', () => {
    expect(findPreviousCompletedMeeting([], 'current', '2026-06-01T10:00:00Z')).toBeUndefined()
  })
})
