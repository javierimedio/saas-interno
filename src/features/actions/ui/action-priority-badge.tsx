import { Badge } from '@/components/ui/badge'
import { ACTION_PRIORITY_LABELS } from '../domain/action.schema'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type ActionPriority = Database['public']['Enums']['action_priority']

const VARIANT: Record<ActionPriority, 'success' | 'neutral' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'neutral',
  high: 'warning',
  urgent: 'danger',
}

export function ActionPriorityBadge({ priority }: { priority: ActionPriority }) {
  return <Badge variant={VARIANT[priority]}>{ACTION_PRIORITY_LABELS[priority]}</Badge>
}
