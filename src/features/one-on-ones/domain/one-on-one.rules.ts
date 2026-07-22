import type { Database } from '@/shared/infrastructure/supabase/database.types'

type Status = Database['public']['Enums']['one_on_one_status']

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
