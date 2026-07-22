'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { startPreparationAction } from '../application/start-preparation.action'
import { startMeetingAction } from '../application/start-meeting.action'
import { cancelMeetingAction } from '../application/cancel-meeting.action'
import type { Database } from '@/shared/infrastructure/supabase/database.types'

type Status = Database['public']['Enums']['one_on_one_status']

export function MeetingTransitionButtons({ meetingId, status }: { meetingId: string; status: Status }) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setIsPending(true)
    const result = await action()
    setIsPending(false)
    if (!result.ok) {
      toast.error(result.error ?? 'No se pudo completar la acción')
      return
    }
    router.refresh()
  }

  if (status === 'completed' || status === 'cancelled') return null

  return (
    <div className="flex items-center gap-2">
      {status === 'scheduled' ? (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => startPreparationAction(meetingId))}>
          Iniciar preparación
        </Button>
      ) : null}
      {(status === 'scheduled' || status === 'preparing') ? (
        <Button size="sm" disabled={isPending} onClick={() => run(() => startMeetingAction(meetingId))}>
          Iniciar reunión
        </Button>
      ) : null}
      <CancelDialog meetingId={meetingId} disabled={isPending} />
    </div>
  )
}

function CancelDialog({ meetingId, disabled }: { meetingId: string; disabled: boolean }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleConfirm() {
    setIsSubmitting(true)
    const result = await cancelMeetingAction({ id: meetingId })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Reunión cancelada')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          Cancelar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar reunión</DialogTitle>
          <DialogDescription>Esta reunión pasará a estado cancelado. No se elimina, queda en el historial.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Volver
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Cancelando…' : 'Confirmar cancelación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
