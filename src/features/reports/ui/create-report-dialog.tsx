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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  EMPLOYEE_REPORT_TYPE,
  REPORT_TYPE_LABELS,
  generateEmployeeReportSchema,
  type GenerateEmployeeReportInput,
} from '../domain/report.schema'
import { generateEmployeeReportAction } from '../application/generate-employee-report.action'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

export function CreateReportDialog({
  people,
  defaultPersonId,
}: {
  people: Pick<PersonRow, 'id' | 'first_name' | 'last_name'>[]
  defaultPersonId?: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<z.input<typeof generateEmployeeReportSchema>, unknown, GenerateEmployeeReportInput>({
    resolver: zodResolver(generateEmployeeReportSchema),
    defaultValues: { personId: defaultPersonId ?? '', type: 'employee_summary' },
  })

  const type = form.watch('type')

  async function onSubmit(values: GenerateEmployeeReportInput) {
    setIsSubmitting(true)
    const result = await generateEmployeeReportAction(values)
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Informe generado')
    setOpen(false)
    form.reset({ personId: defaultPersonId ?? '', type: 'employee_summary' })
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Generar informe
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar informe</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {!defaultPersonId ? (
              <FormField
                control={form.control}
                name="personId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.first_name} {p.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de informe</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYEE_REPORT_TYPE.map((t) => (
                        <SelectItem key={t} value={t}>
                          {REPORT_TYPE_LABELS[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {type === 'employee_annual' ? (
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={(field.value as number | string | undefined) ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Generando…' : 'Generar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
