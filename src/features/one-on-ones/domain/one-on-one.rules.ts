import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { BlockData } from './one-on-one.schema'

type Status = Database['public']['Enums']['one_on_one_status']
type OneOnOneRow = Database['public']['Tables']['one_on_ones']['Row']

const TRANSITIONS: Record<Status, Status[]> = {
  scheduled: ['preparing', 'in_progress', 'cancelled'],
  preparing: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from].includes(to)
}

/** docs/product-design/04-dashboard.md §4.3: 1:1 programado cuya fecha ya pasó sin cerrarse. */
export function isMeetingOverdue(scheduledAt: string, status: Status, now: Date): boolean {
  if (status === 'completed' || status === 'cancelled') return false
  return new Date(scheduledAt) < now
}

export function isMeetingActive(status: Status): boolean {
  return status !== 'completed' && status !== 'cancelled'
}

/**
 * De "pendiente" a "en edición" en cuanto hay contenido — sin acción del responsable. El paso a
 * "completado" es siempre una decisión explícita (checkbox "Marcar como tratado"), nunca automático.
 */
export function autoAdvanceBlockStatus(block: BlockData): BlockData['status'] {
  if (block.status !== 'pending') return block.status
  const hasContent = Object.values(block.fields).some((value) => value.trim().length > 0)
  return hasContent ? 'in_progress' : 'pending'
}

/** El One2One completado más reciente de la persona, anterior a la reunión actual (para "Preparación"). */
export function findPreviousCompletedMeeting(
  meetings: OneOnOneRow[],
  currentMeetingId: string,
  currentScheduledAt: string,
): OneOnOneRow | undefined {
  return meetings
    .filter((m) => m.id !== currentMeetingId && m.status === 'completed' && m.scheduled_at < currentScheduledAt)
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0]
}
