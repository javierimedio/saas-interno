'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addCareerMilestoneAction } from '../application/add-career-milestone.action'

export function AddMilestoneForm({ careerPlanId }: { careerPlanId: string }) {
  const router = useRouter()
  const [title, setTitle] = React.useState('')
  const [targetDate, setTargetDate] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (title.trim().length === 0) return
    setIsSubmitting(true)
    const result = await addCareerMilestoneAction({ careerPlanId, title, targetDate: targetDate || undefined })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setTitle('')
    setTargetDate('')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Input placeholder="Nuevo hito…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-40" />
      <Button size="sm" variant="outline" onClick={handleSubmit} disabled={isSubmitting || title.trim().length === 0}>
        Añadir
      </Button>
    </div>
  )
}
