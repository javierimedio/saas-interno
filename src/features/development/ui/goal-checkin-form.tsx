'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addGoalCheckinAction } from '../application/add-goal-checkin.action'

export function GoalCheckinForm({ goalId, latestProgress }: { goalId: string; latestProgress: number }) {
  const router = useRouter()
  const [progress, setProgress] = React.useState(String(latestProgress))
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    setIsSubmitting(true)
    const result = await addGoalCheckinAction({ goalId, progressPercent: Number(progress) })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={100}
        value={progress}
        onChange={(e) => setProgress(e.target.value)}
        className="w-20"
      />
      <span className="text-sm text-muted-foreground">%</span>
      <Button size="sm" variant="outline" onClick={handleSubmit} disabled={isSubmitting}>
        Registrar avance
      </Button>
    </div>
  )
}
