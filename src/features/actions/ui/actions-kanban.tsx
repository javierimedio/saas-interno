'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { changeActionStatusAction } from '../application/change-action-status.action'
import { ACTION_STATUS, ACTION_STATUS_LABELS } from '../domain/action.schema'
import { isActionOverdue } from '../domain/action.rules'
import type { ActionRow } from '../infrastructure/actions.repository'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type ActionStatus = Database['public']['Enums']['action_status']

const PRIORITY_BORDER: Record<string, string> = {
  low: 'border-l-border-strong',
  medium: 'border-l-primary',
  high: 'border-l-warning',
  urgent: 'border-l-destructive',
}

export function ActionsKanban({
  actions,
  peopleNamesById,
}: {
  actions: ActionRow[]
  peopleNamesById: Map<string, string>
}) {
  const router = useRouter()
  const [dragId, setDragId] = React.useState<string | null>(null)
  const now = new Date()

  async function handleDrop(status: ActionStatus) {
    if (!dragId) return
    const action = actions.find((a) => a.id === dragId)
    setDragId(null)
    if (!action || action.status === status) return

    if (status === 'blocked') {
      const reason = window.prompt('Motivo del bloqueo:')
      if (!reason) return
      const result = await changeActionStatusAction({ id: action.id, status, blockedReason: reason })
      if (!result.ok) toast.error(result.error)
      router.refresh()
      return
    }

    const result = await changeActionStatusAction({ id: action.id, status })
    if (!result.ok) toast.error(result.error)
    router.refresh()
  }

  if (actions.length === 0) {
    return <EmptyState title="Sin acciones que coincidan con los filtros" />
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {ACTION_STATUS.map((status) => {
        const columnActions = actions.filter((a) => a.status === status)
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status)}
            className="flex flex-col gap-2 rounded-lg bg-secondary/30 p-2"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold">{ACTION_STATUS_LABELS[status]}</span>
              <span className="text-xs tabular-nums text-text-faint">{columnActions.length}</span>
            </div>
            {columnActions.map((action) => {
              const overdue = isActionOverdue(action.due_date, action.status, now)
              return (
                <Link
                  href={`/actions/${action.id}`}
                  key={action.id}
                  draggable
                  onDragStart={() => setDragId(action.id)}
                  className={`cursor-grab rounded-md border border-l-[3px] border-border bg-card p-2.5 text-sm shadow-xs active:cursor-grabbing ${PRIORITY_BORDER[action.priority]}`}
                >
                  <p className="font-medium">{action.title}</p>
                  <p className="mt-1 text-xs text-text-faint">{peopleNamesById.get(action.assignee_id) ?? '—'}</p>
                  {action.due_date ? (
                    <p className={`mt-1 text-xs ${overdue ? 'font-semibold text-destructive' : 'text-text-faint'}`}>
                      {overdue ? 'Venció ' : ''}
                      {new Date(action.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
