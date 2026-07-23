'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TRAINING_STATUS, TRAINING_STATUS_LABELS } from '../domain/development.schema'
import { updateTrainingStatusAction } from '../application/update-training-status.action'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type TrainingStatus = Database['public']['Enums']['training_status']

export function TrainingStatusControl({ trainingId, status }: { trainingId: string; status: TrainingStatus }) {
  const router = useRouter()

  async function handleChange(next: string) {
    const result = await updateTrainingStatusAction({ id: trainingId, status: next as TrainingStatus })
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
        {TRAINING_STATUS.map((s) => (
          <SelectItem key={s} value={s}>
            {TRAINING_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
