'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ACTION_STATUS, ACTION_STATUS_LABELS } from '../domain/action.schema'
import { changeActionStatusAction } from '../application/change-action-status.action'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type ActionStatus = Database['public']['Enums']['action_status']

export function ActionStatusControl({ actionId, status }: { actionId: string; status: ActionStatus }) {
  const router = useRouter()

  async function handleChange(next: string) {
    const nextStatus = next as ActionStatus
    let blockedReason: string | undefined
    if (nextStatus === 'blocked') {
      const reason = window.prompt('Motivo del bloqueo:')
      if (!reason) return
      blockedReason = reason
    }
    const result = await changeActionStatusAction({ id: actionId, status: nextStatus, blockedReason })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ACTION_STATUS.map((s) => (
          <SelectItem key={s} value={s}>
            {ACTION_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
