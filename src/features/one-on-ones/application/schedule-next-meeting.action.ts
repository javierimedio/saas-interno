'use server'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { getMeetingById, scheduleMeeting, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'

/** Botón "Programar siguiente" en el cierre de un 1:1 (docs/05-flujo-navegacion.md §5.2). */
export async function scheduleNextMeetingAction(previousMeetingId: string): Promise<Result<OneOnOneRow>> {
  const session = await requireCurrentSession()
  const supabase = await createClient()

  const previous = await getMeetingById(supabase, previousMeetingId)
  if (!previous) return err('Reunión no encontrada')
  if (!previous.next_meeting_suggested_at) {
    return err('Esta reunión no tiene una próxima fecha sugerida')
  }

  try {
    const next = await scheduleMeeting(supabase, session.organizationId, previous.manager_id, session.userId, {
      personId: previous.person_id,
      scheduledAt: previous.next_meeting_suggested_at,
      mode: previous.mode,
    })
    return ok(next)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo programar la siguiente reunión')
  }
}
