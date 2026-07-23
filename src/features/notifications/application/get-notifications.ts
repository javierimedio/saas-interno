import { createClient } from '@/shared/infrastructure/supabase/server-client'
import type { CurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listAllPeople } from '@/features/people/infrastructure/people.repository'
import { listSalaryRecordsGlobal } from '@/features/people/infrastructure/salary-records.repository'
import { listActionsGlobal } from '@/features/actions/infrastructure/actions.repository'
import { listMeetingsInRange } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { buildNotifications, type AppNotification } from '../domain/notification.rules'

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Agrega el centro de notificaciones a partir de datos que ya existen (cumpleaños, One2One,
 * acciones, altas, revisiones salariales). Las mismas consultas que usa el dashboard: RLS ya
 * limita cada una al alcance del usuario actual (todo para admin, solo lo propio para empleado).
 */
export async function getNotifications(session: CurrentSession): Promise<AppNotification[]> {
  const supabase = await createClient()
  const now = new Date()
  const from = startOfDay(now)
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 2)

  const [people, salaryRecords, actions, meetingsTodayTomorrow] = await Promise.all([
    listAllPeople(supabase, session.organizationId),
    listSalaryRecordsGlobal(supabase, session.organizationId),
    listActionsGlobal(supabase, session.organizationId, {}),
    listMeetingsInRange(supabase, session.organizationId, from.toISOString(), to.toISOString()),
  ])

  return buildNotifications({ people, salaryRecords, actions, meetingsTodayTomorrow }, now)
}
