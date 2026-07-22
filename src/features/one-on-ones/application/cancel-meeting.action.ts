'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { canTransition } from '../domain/one-on-one.rules'
import { cancelOneOnOneSchema, type CancelOneOnOneInput } from '../domain/one-on-one.schema'
import { getMeetingById, transitionMeetingStatus, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export async function cancelMeetingAction(input: CancelOneOnOneInput): Promise<Result<OneOnOneRow>> {
  const parsed = cancelOneOnOneSchema.safeParse(input)
  if (!parsed.success) {
    return err('Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  const meeting = await getMeetingById(supabase, parsed.data.id)
  if (!meeting) return err('Reunión no encontrada')
  if (!canTransition(meeting.status, 'cancelled')) {
    return err('No se puede cancelar la reunión desde el estado actual')
  }

  try {
    const updated = await transitionMeetingStatus(supabase, parsed.data.id, 'cancelled')
    revalidatePath(`/one-on-ones/${updated.id}`)
    revalidatePath('/one-on-ones')
    revalidatePath('/calendar')
    revalidatePath(`/people/${updated.person_id}`)
    return ok(updated)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo cancelar la reunión')
  }
}
