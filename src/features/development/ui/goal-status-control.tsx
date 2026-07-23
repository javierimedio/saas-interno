'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GOAL_STATUS, GOAL_STATUS_LABELS } from '../domain/goal.schema'
import { updateGoalStatusAction } from '../application/update-goal-status.action'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type GoalStatus = Database['public']['Enums']['goal_status']

export function GoalStatusControl({ goalId, status }: { goalId: string; status: GoalStatus }) {
  const router = useRouter()

  async function handleChange(next: string) {
    const result = await updateGoalStatusAction({ id: goalId, status: next as GoalStatus })
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <Select value={status} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GOAL_STATUS.map((s) => (
          <SelectItem key={s} value={s}>
            {GOAL_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
