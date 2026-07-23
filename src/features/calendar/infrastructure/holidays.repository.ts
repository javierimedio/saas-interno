import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { CreateHolidayInput } from '../domain/time-off.schema'

type TypedClient = SupabaseClient<Database>
export type HolidayRow = Database['public']['Tables']['holidays']['Row']

export async function listHolidaysInRange(
  client: TypedClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<HolidayRow[]> {
  const { data, error } = await client
    .from('holidays')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los festivos: ${error.message}`)
  return data ?? []
}

export async function listHolidaysByYear(client: TypedClient, organizationId: string, year: number): Promise<HolidayRow[]> {
  const { data, error } = await client
    .from('holidays')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los festivos: ${error.message}`)
  return data ?? []
}

export async function createHoliday(client: TypedClient, organizationId: string, input: CreateHolidayInput): Promise<HolidayRow> {
  const { data, error } = await client
    .from('holidays')
    .insert({ organization_id: organizationId, date: input.date, name: input.name })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo crear el festivo: ${error.message}`)
  return data
}

export async function deleteHoliday(client: TypedClient, id: string): Promise<void> {
  const { error } = await client.from('holidays').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el festivo: ${error.message}`)
}
