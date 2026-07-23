import { Badge } from '@/components/ui/badge'
import { GOAL_STATUS_LABELS } from '../domain/goal.schema'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type GoalStatus = Database['public']['Enums']['goal_status']

const VARIANT: Record<GoalStatus, 'success' | 'neutral' | 'outline' | 'danger' | 'warning' | 'accent'> = {
  on_track: 'success',
  at_risk: 'warning',
  off_track: 'danger',
  completed: 'accent',
  cancelled: 'neutral',
}

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  return <Badge variant={VARIANT[status] ?? 'neutral'}>{GOAL_STATUS_LABELS[status]}</Badge>
}
