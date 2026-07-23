'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { scheduleNextMeetingAction } from '../application/schedule-next-meeting.action'

export function ScheduleNextButton({ meetingId }: { meetingId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleClick() {
    setIsSubmitting(true)
    const result = await scheduleNextMeetingAction(meetingId)
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Siguiente One2One programado')
    router.push(`/one-on-ones/${result.data.id}`)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isSubmitting}>
      {isSubmitting ? 'Programando…' : 'Programar siguiente'}
    </Button>
  )
}
