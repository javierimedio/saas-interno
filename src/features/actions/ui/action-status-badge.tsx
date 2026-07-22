import { Badge } from '@/components/ui/badge'
import { ACTION_STATUS_LABELS } from '../domain/action.schema'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type ActionStatus = Database['public']['Enums']['action_status']

const VARIANT: Record<ActionStatus, 'success' | 'neutral' | 'outline' | 'danger' | 'warning' | 'accent'> = {
  pending: 'outline',
  in_progress: 'accent',
  blocked: 'danger',
  completed: 'success',
  cancelled: 'neutral',
}

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  return <Badge variant={VARIANT[status] ?? 'neutral'}>{ACTION_STATUS_LABELS[status]}</Badge>
}
