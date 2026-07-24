'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updateNextMeetingSchema, type UpdateNextMeetingInput } from '../domain/one-on-one.schema'
import { updateNextMeetingDate, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export async function updateNextMeetingAction(input: UpdateNextMeetingInput): Promise<Result<OneOnOneRow>> {
  const parsed = updateNextMeetingSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const meeting = await updateNextMeetingDate(supabase, parsed.data)
    revalidatePath(`/one-on-ones/${meeting.id}`)
    return ok(meeting)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo guardar la fecha')
  }
}
