'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { EmptyState } from '@/components/shared/empty-state'
import { workingHoursLabel } from '../domain/person.rules'
import { workingHoursRecordSchema, type WorkingHoursRecordInput } from '../domain/person.schema'
import { addWorkingHoursRecordAction } from '../application/add-working-hours-record.action'
import type { WorkingHoursRecordRow } from '../infrastructure/working-hours-records.repository'

export function WorkingHoursHistoryPanel({ personId, records }: { personId: string; records: WorkingHoursRecordRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Histórico completo, nunca se sobrescribe.</p>
        <AddWorkingHoursRecordDialog personId={personId} />
      </div>

      {records.length === 0 ? (
        <EmptyState title="Sin registros de jornada" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {records.map((record) => (
            <div key={record.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">
                  {record.reason}{' '}
                  <span className="font-normal text-text-faint">
                    · {new Date(record.effective_date).toLocaleDateString('es-ES')}
                  </span>
                </p>
                {record.notes ? <p className="text-muted-foreground">{record.notes}</p> : null}
              </div>
              <p className="tabular-nums font-semibold">
                {workingHoursLabel(record.weekly_hours)} · {record.weekly_hours} h/sem
                {record.working_percentage ? ` (${record.working_percentage}%)` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddWorkingHoursRecordDialog({ personId }: { personId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.input<typeof workingHoursRecordSchema>, unknown, WorkingHoursRecordInput>({
    resolver: zodResolver(workingHoursRecordSchema),
    defaultValues: {
      personId,
      effectiveDate: new Date().toISOString().slice(0, 10),
      reason: '',
    },
  })

  async function onSubmit(values: WorkingHoursRecordInput) {
    setIsSubmitting(true)
    const result = await addWorkingHoursRecordAction(values)
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Cambio de jornada registrado')
    setOpen(false)
    form.reset({ personId, effectiveDate: new Date().toISOString().slice(0, 10), reason: '' })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Añadir cambio de jornada
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo cambio de jornada</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de efecto</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo</FormLabel>
                    <FormControl>
                      <Input placeholder="p. ej. reducción de jornada" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weeklyHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas semanales</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.5"
                        {...field}
                        value={(field.value as number | string | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="workingPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% jornada (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step="1"
                        {...field}
                        value={(field.value as number | string | undefined) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
