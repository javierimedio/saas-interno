'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { canTransition } from '../domain/one-on-one.rules'
import { closeOneOnOneSchema, type CloseOneOnOneInput } from '../domain/one-on-one.schema'
import { closeMeeting, getMeetingById, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export async function closeMeetingAction(input: CloseOneOnOneInput): Promise<Result<OneOnOneRow>> {
  const parsed = closeOneOnOneSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  const meeting = await getMeetingById(supabase, parsed.data.id)
  if (!meeting) return err('Reunión no encontrada')
  if (!canTransition(meeting.status, 'completed')) {
    return err('No se puede cerrar la reunión desde el estado actual')
  }

  try {
    const updated = await closeMeeting(supabase, parsed.data)
    revalidatePath(`/one-on-ones/${updated.id}`)
    revalidatePath('/one-on-ones')
    revalidatePath(`/people/${updated.person_id}`)
    return ok(updated)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo cerrar la reunión')
  }
}
