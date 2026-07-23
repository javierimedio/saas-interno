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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { salaryRecordSchema, type SalaryRecordInput } from '../domain/person.schema'
import { addSalaryRecordAction } from '../application/add-salary-record.action'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'

const REASON_LABELS: Record<string, string> = {
  hire: 'Salario inicial',
  review: 'Revisión',
  promotion: 'Promoción',
  market_adjustment: 'Ajuste de mercado',
  correction: 'Corrección',
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function SalaryHistoryPanel({ personId, records }: { personId: string; records: SalaryRecordRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Histórico completo, nunca se sobrescribe.</p>
        <AddSalaryRecordDialog personId={personId} />
      </div>

      {records.length === 0 ? (
        <EmptyState title="Sin registros de salario" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {records.map((record) => (
            <div key={record.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">
                  {REASON_LABELS[record.reason] ?? record.reason}{' '}
                  <span className="font-normal text-text-faint">
                    · {new Date(record.effective_date).toLocaleDateString('es-ES')}
                  </span>
                </p>
                {record.notes ? <p className="text-muted-foreground">{record.notes}</p> : null}
              </div>
              <p className="tabular-nums font-semibold">{formatCurrency(record.gross_annual_salary, record.currency)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddSalaryRecordDialog({ personId }: { personId: string }) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.input<typeof salaryRecordSchema>, unknown, SalaryRecordInput>({
    resolver: zodResolver(salaryRecordSchema),
    defaultValues: {
      personId,
      effectiveDate: new Date().toISOString().slice(0, 10),
      currency: 'EUR',
      reason: 'review',
    },
  })

  async function onSubmit(values: SalaryRecordInput) {
    setIsSubmitting(true)
    const result = await addSalaryRecordAction(values)
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Revisión salarial registrada')
    setOpen(false)
    form.reset({ personId, effectiveDate: new Date().toISOString().slice(0, 10), currency: 'EUR', reason: 'review' })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus />
          Añadir revisión
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva revisión salarial</DialogTitle>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="review">Revisión</SelectItem>
                        <SelectItem value="promotion">Promoción</SelectItem>
                        <SelectItem value="market_adjustment">Ajuste de mercado</SelectItem>
                        <SelectItem value="correction">Corrección</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grossAnnualSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario bruto anual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
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
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <FormControl>
                      <Input maxLength={3} className="uppercase" {...field} />
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
