'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { canTransition } from '../domain/one-on-one.rules'
import { getMeetingById, transitionMeetingStatus, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export async function startMeetingAction(id: string): Promise<Result<OneOnOneRow>> {
  await requireCurrentSession()
  const supabase = await createClient()

  const meeting = await getMeetingById(supabase, id)
  if (!meeting) return err('Reunión no encontrada')
  if (!canTransition(meeting.status, 'in_progress')) {
    return err('No se puede iniciar la reunión desde el estado actual')
  }

  try {
    const updated = await transitionMeetingStatus(supabase, id, 'in_progress', {
      actual_started_at: new Date().toISOString(),
    })
    revalidatePath(`/one-on-ones/${id}`)
    return ok(updated)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo iniciar la reunión')
  }
}
