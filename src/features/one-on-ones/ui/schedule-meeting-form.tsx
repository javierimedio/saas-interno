'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MEETING_MODE, MEETING_MODE_LABELS, scheduleOneOnOneSchema, type ScheduleOneOnOneInput } from '../domain/one-on-one.schema'
import { scheduleMeetingAction } from '../application/schedule-meeting.action'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

function defaultDateTime(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setMinutes(0, 0, 0)
  return d.toISOString().slice(0, 16)
}

export function ScheduleMeetingForm({
  people,
}: {
  people: Pick<PersonRow, 'id' | 'first_name' | 'last_name' | 'position_title'>[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<ScheduleOneOnOneInput>({
    resolver: zodResolver(scheduleOneOnOneSchema),
    defaultValues: {
      personId: searchParams.get('personId') ?? '',
      scheduledAt: defaultDateTime(),
      mode: 'video',
    },
  })

  async function onSubmit(values: ScheduleOneOnOneInput) {
    setIsSubmitting(true)
    const result = await scheduleMeetingAction(values)
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success('Reunión programada')
    router.push(`/one-on-ones/${result.data.id}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-5">
        <FormField
          control={form.control}
          name="personId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una persona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {people.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.first_name} {person.last_name} · {person.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha y hora</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MEETING_MODE.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {MEETING_MODE_LABELS[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Programando…' : 'Programar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
