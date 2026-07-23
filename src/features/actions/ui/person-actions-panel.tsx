import Link from 'next/link'

import { EmptyState } from '@/components/shared/empty-state'
import { ActionStatusBadge } from './action-status-badge'
import { ActionPriorityBadge } from './action-priority-badge'
import { isActionOverdue } from '../domain/action.rules'
import type { ActionRow } from '../infrastructure/actions.repository'

export function PersonActionsPanel({ actions }: { actions: ActionRow[] }) {
  if (actions.length === 0) {
    return <EmptyState title="Sin acciones para esta persona" />
  }

  const now = new Date()

  return (
    <div className="flex flex-col divide-y divide-border">
      {actions.map((action) => (
        <Link
          key={action.id}
          href={`/actions/${action.id}`}
          className="flex items-center justify-between gap-3 py-2.5 text-sm hover:bg-secondary/40"
        >
          <span className="flex-1">{action.title}</span>
          {action.due_date ? (
            <span className={isActionOverdue(action.due_date, action.status, now) ? 'font-semibold text-destructive' : 'text-text-faint'}>
              {new Date(action.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
          ) : null}
          <ActionPriorityBadge priority={action.priority} />
          <ActionStatusBadge status={action.status} />
        </Link>
      ))}
    </div>
  )
}
