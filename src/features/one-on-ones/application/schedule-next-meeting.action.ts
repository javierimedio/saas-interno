'use server'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { getMeetingById, scheduleMeeting, type OneOnOneRow } from '../infrastructure/one-on-ones.repository'
import { CUSTOMIZABLE_BLOCK_KEYS, type OneOnOneTemplateKey } from '../domain/one-on-one-templates'
import type { MeetingData } from '../domain/one-on-one.schema'

/** Botón "Programar siguiente" en el cierre de un 1:1 (docs/05-flujo-navegacion.md §5.2). */
export async function scheduleNextMeetingAction(previousMeetingId: string): Promise<Result<OneOnOneRow>> {
  const session = await requireCurrentSession()
  const supabase = await createClient()

  const previous = await getMeetingById(supabase, previousMeetingId)
  if (!previous) return err('Reunión no encontrada')
  if (!previous.next_meeting_suggested_at) {
    return err('Esta reunión no tiene una próxima fecha sugerida')
  }

  // Se mantiene la misma plantilla (y, si era Personalizado, los mismos bloques elegidos).
  const templateKey = previous.template_key as OneOnOneTemplateKey
  const previousBlockKeys = Object.keys((previous.meeting_data as MeetingData | null)?.blocks ?? {})
  const customBlockKeys =
    templateKey === 'custom' ? previousBlockKeys.filter((key) => (CUSTOMIZABLE_BLOCK_KEYS as string[]).includes(key)) : undefined

  try {
    const next = await scheduleMeeting(supabase, session.organizationId, previous.manager_id, session.userId, {
      personId: previous.person_id,
      scheduledAt: previous.next_meeting_suggested_at,
      mode: previous.mode,
      templateKey,
      customBlockKeys,
    })
    return ok(next)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo programar la siguiente reunión')
  }
}
