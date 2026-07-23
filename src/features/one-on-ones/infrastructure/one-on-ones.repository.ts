import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type {
  CloseOneOnOneInput,
  MeetingListFilters,
  ScheduleOneOnOneInput,
  UpdateOneOnOneInput,
} from '../domain/one-on-one.schema'

type TypedClient = SupabaseClient<Database>
export type OneOnOneRow = Database['public']['Tables']['one_on_ones']['Row']
type Status = Database['public']['Enums']['one_on_one_status']

export const PAGE_SIZE = 20

export type MeetingListResult = {
  meetings: OneOnOneRow[]
  total: number
  page: number
  pageSize: number
}

export async function listMeetings(
  client: TypedClient,
  organizationId: string,
  filters: MeetingListFilters,
): Promise<MeetingListResult> {
  const page = filters.page ?? 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = client
    .from('one_on_ones')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('scheduled_at', { ascending: false })
    .range(from, to)

  if (filters.personId) query = query.eq('person_id', filters.personId)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.from) query = query.gte('scheduled_at', filters.from)
  if (filters.to) query = query.lte('scheduled_at', filters.to)

  const { data, error, count } = await query
  if (error) throw new Error(`No se pudieron cargar las reuniones: ${error.message}`)

  return { meetings: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE }
}

export async function listMeetingsInRange(
  client: TypedClient,
  organizationId: string,
  fromIso: string,
  toIso: string,
): Promise<OneOnOneRow[]> {
  const { data, error } = await client
    .from('one_on_ones')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('scheduled_at', fromIso)
    .lte('scheduled_at', toIso)
    .order('scheduled_at', { ascending: true })

  if (error) throw new Error(`No se pudo cargar el calendario: ${error.message}`)
  return data ?? []
}

export async function listUpcomingMeetings(
  client: TypedClient,
  organizationId: string,
  nowIso: string,
  limit: number,
): Promise<OneOnOneRow[]> {
  const { data, error } = await client
    .from('one_on_ones')
    .select('*')
    .eq('organization_id', organizationId)
    .in('status', ['scheduled', 'preparing'])
    .gte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error) throw new Error(`No se pudieron cargar los próximos One2One: ${error.message}`)
  return data ?? []
}

export async function listOverdueMeetings(
  client: TypedClient,
  organizationId: string,
  nowIso: string,
): Promise<OneOnOneRow[]> {
  const { data, error } = await client
    .from('one_on_ones')
    .select('*')
    .eq('organization_id', organizationId)
    .in('status', ['scheduled', 'preparing'])
    .lt('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los One2One pendientes: ${error.message}`)
  return data ?? []
}

export async function listRecentlyCompletedMeetings(
  client: TypedClient,
  organizationId: string,
  limit: number,
): Promise<OneOnOneRow[]> {
  const { data, error } = await client
    .from('one_on_ones')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`No se pudieron cargar los últimos One2One: ${error.message}`)
  return data ?? []
}

export async function listMeetingsByPerson(client: TypedClient, personId: string): Promise<OneOnOneRow[]> {
  const { data, error } = await client
    .from('one_on_ones')
    .select('*')
    .eq('person_id', personId)
    .order('scheduled_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los One2One de la persona: ${error.message}`)
  return data ?? []
}

export async function getMeetingById(client: TypedClient, id: string): Promise<OneOnOneRow | null> {
  const { data, error } = await client.from('one_on_ones').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`No se pudo cargar la reunión: ${error.message}`)
  return data
}

export async function scheduleMeeting(
  client: TypedClient,
  organizationId: string,
  managerId: string,
  createdBy: string,
  input: ScheduleOneOnOneInput,
): Promise<OneOnOneRow> {
  const { data, error } = await client
    .from('one_on_ones')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      manager_id: managerId,
      scheduled_at: input.scheduledAt,
      mode: input.mode,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo programar la reunión: ${error.message}`)
  return data
}

export async function updateMeeting(client: TypedClient, input: UpdateOneOnOneInput): Promise<OneOnOneRow> {
  const { data, error } = await client
    .from('one_on_ones')
    .update({ scheduled_at: input.scheduledAt, mode: input.mode })
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo actualizar la reunión: ${error.message}`)
  return data
}

export async function transitionMeetingStatus(
  client: TypedClient,
  id: string,
  status: Status,
  extra: Partial<Database['public']['Tables']['one_on_ones']['Update']> = {},
): Promise<OneOnOneRow> {
  const { data, error } = await client
    .from('one_on_ones')
    .update({ status, ...extra })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo cambiar el estado de la reunión: ${error.message}`)
  return data
}

export async function closeMeeting(client: TypedClient, input: CloseOneOnOneInput): Promise<OneOnOneRow> {
  const { data, error } = await client
    .from('one_on_ones')
    .update({
      status: 'completed',
      actual_ended_at: new Date().toISOString(),
      manager_comments: input.managerComments || null,
      overall_rating: input.overallRating,
      next_meeting_suggested_at: input.nextMeetingSuggestedAt || null,
    })
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo cerrar la reunión: ${error.message}`)
  return data
}
