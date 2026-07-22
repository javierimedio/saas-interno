'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updateOneOnOneSchema, type UpdateOneOnOneInput } from '../domain/one-on-one.schema'
import { updateMeeting, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export async function updateMeetingAction(input: UpdateOneOnOneInput): Promise<Result<OneOnOneRow>> {
  const parsed = updateOneOnOneSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const meeting = await updateMeeting(supabase, parsed.data)
    revalidatePath('/one-on-ones')
    revalidatePath('/calendar')
    revalidatePath(`/one-on-ones/${meeting.id}`)
    return ok(meeting)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar la reunión')
  }
}
