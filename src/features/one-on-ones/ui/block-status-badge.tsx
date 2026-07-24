import { Badge } from '@/components/ui/badge'
import { BLOCK_STATUS_LABELS } from '../domain/one-on-one.schema'

type BlockStatus = keyof typeof BLOCK_STATUS_LABELS

const BADGE_VARIANT: Record<BlockStatus, 'neutral' | 'warning' | 'success'> = {
  pending: 'neutral',
  in_progress: 'warning',
  completed: 'success',
}

export function BlockStatusBadge({ status }: { status: BlockStatus }) {
  return <Badge variant={BADGE_VARIANT[status]}>{BLOCK_STATUS_LABELS[status]}</Badge>
}
