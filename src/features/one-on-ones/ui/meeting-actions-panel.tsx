'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { createActionAction } from '@/features/actions/application/create-action.action'
import { ActionStatusBadge } from '@/features/actions/ui/action-status-badge'
import { ActionPriorityBadge } from '@/features/actions/ui/action-priority-badge'
import { ACTION_PRIORITY, ACTION_PRIORITY_LABELS } from '@/features/actions/domain/action.schema'
import type { ActionRow } from '@/features/actions/infrastructure/actions.repository'

export function MeetingActionsPanel({
  oneOnOneId,
  personId,
  managerId,
  personName,
  managerName,
  actions,
  readOnly = false,
}: {
  oneOnOneId: string
  personId: string
  managerId: string
  personName: string
  managerName: string
  actions: ActionRow[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [assigneeId, setAssigneeId] = React.useState(personId)
  const [priority, setPriority] = React.useState<(typeof ACTION_PRIORITY)[number]>('medium')
  const [isCreating, setIsCreating] = React.useState(false)

  async function handleCreate() {
    if (title.trim().length === 0) return
    setIsCreating(true)
    const result = await createActionAction({ personId, assigneeId, oneOnOneId, title, priority })
    setIsCreating(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setTitle('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {actions.length === 0 ? (
        <EmptyState title="Sin acciones creadas en esta reunión" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {actions.map((action) => (
            <div key={action.id} className="flex items-center justify-between py-2 text-sm">
              <span className="flex-1">{action.title}</span>
              <div className="flex items-center gap-1.5">
                <ActionPriorityBadge priority={action.priority} />
                <ActionStatusBadge status={action.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly ? (
        <div className="flex flex-wrap gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Crear acción rápida…"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              }
            }}
          />
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={personId}>{personName}</SelectItem>
              <SelectItem value={managerId}>{managerName}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_PRIORITY.map((p) => (
                <SelectItem key={p} value={p}>
                  {ACTION_PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleCreate} disabled={isCreating || title.trim().length === 0}>
            Crear
          </Button>
        </div>
      ) : null}
    </div>
  )
}
