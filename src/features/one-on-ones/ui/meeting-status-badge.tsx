import { Badge } from '@/components/ui/badge'
import { ONE_ON_ONE_STATUS_LABELS } from '../domain/one-on-one.schema'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type Status = Database['public']['Enums']['one_on_one_status']

const VARIANT: Record<Status, 'success' | 'neutral' | 'outline' | 'danger' | 'accent'> = {
  scheduled: 'outline',
  preparing: 'accent',
  in_progress: 'accent',
  completed: 'success',
  cancelled: 'neutral',
}

export function MeetingStatusBadge({ status }: { status: Status }) {
  return <Badge variant={VARIANT[status]}>{ONE_ON_ONE_STATUS_LABELS[status]}</Badge>
}
