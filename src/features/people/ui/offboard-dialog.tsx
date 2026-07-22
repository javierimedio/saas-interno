'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { offboardPersonAction } from '../application/offboard-person.action'

export function OffboardDialog({ personId, personName }: { personId: string; personName: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [terminationDate, setTerminationDate] = React.useState(new Date().toISOString().slice(0, 10))
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleConfirm() {
    setIsSubmitting(true)
    const result = await offboardPersonAction({ id: personId, terminationDate })
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(`${personName} ha sido dada de baja`)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Dar de baja
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dar de baja a {personName}</DialogTitle>
          <DialogDescription>
            Es una baja lógica: se conserva todo su historial y ficha, solo cambia su estado a
            &quot;Baja&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="termination-date">Fecha de baja</Label>
          <Input
            id="termination-date"
            type="date"
            value={terminationDate}
            onChange={(event) => setTerminationDate(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Procesando…' : 'Confirmar baja'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
