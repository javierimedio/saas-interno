'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updateMeetingDataSchema, type UpdateMeetingDataInput } from '../domain/one-on-one.schema'
import { updateMeetingData, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

/** "Guardar borrador": persiste el contenido narrativo completo de la reunión. */
export async function updateMeetingDataAction(input: UpdateMeetingDataInput): Promise<Result<OneOnOneRow>> {
  const parsed = updateMeetingDataSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const meeting = await updateMeetingData(supabase, parsed.data.id, parsed.data.blocksPatch)
    revalidatePath(`/one-on-ones/${meeting.id}`)
    return ok(meeting)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo guardar el borrador')
  }
}
