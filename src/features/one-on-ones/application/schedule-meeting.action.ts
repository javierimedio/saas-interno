'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { getPersonById } from '@/features/people/infrastructure/people.repository'
import { err, ok, type Result } from '@/shared/domain/result'
import { scheduleOneOnOneSchema, type ScheduleOneOnOneInput } from '../domain/one-on-one.schema'
import { scheduleMeeting, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export async function scheduleMeetingAction(input: ScheduleOneOnOneInput): Promise<Result<OneOnOneRow>> {
  const parsed = scheduleOneOnOneSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  const supabase = await createClient()

  const person = await getPersonById(supabase, parsed.data.personId)
  if (!person) {
    return err('Persona no encontrada')
  }
  if (!person.manager_id) {
    return err('Esta persona no tiene un responsable asignado — asígnalo antes de programar un 1:1')
  }

  try {
    const meeting = await scheduleMeeting(supabase, session.organizationId, person.manager_id, session.userId, parsed.data)
    revalidatePath('/one-on-ones')
    revalidatePath('/calendar')
    revalidatePath(`/people/${person.id}`)
    return ok(meeting)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo programar la reunión')
  }
}
