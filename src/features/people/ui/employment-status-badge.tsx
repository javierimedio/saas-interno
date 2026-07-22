import { Badge } from '@/components/ui/badge'
import { EMPLOYMENT_STATUS_LABELS } from '../domain/person.schema'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type EmploymentStatus = Database['public']['Enums']['employment_status']

const VARIANT: Record<EmploymentStatus, 'success' | 'neutral' | 'outline'> = {
  active: 'success',
  on_leave: 'outline',
  offboarded: 'neutral',
}

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  return <Badge variant={VARIANT[status]}>{EMPLOYMENT_STATUS_LABELS[status]}</Badge>
}
