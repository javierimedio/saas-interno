import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database, Json } from '@/shared/infrastructure/supabase/database.types'

type TypedClient = SupabaseClient<Database>
export type ReportRow = Database['public']['Tables']['reports']['Row']
export type ReportType = Database['public']['Enums']['report_type']

export async function listReportsGlobal(client: TypedClient, organizationId: string): Promise<ReportRow[]> {
  const { data, error } = await client
    .from('reports')
    .select('*')
    .eq('organization_id', organizationId)
    .order('generated_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los informes: ${error.message}`)
  return data ?? []
}

export async function listReportsByPerson(client: TypedClient, personId: string): Promise<ReportRow[]> {
  const { data, error } = await client
    .from('reports')
    .select('*')
    .eq('person_id', personId)
    .order('generated_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los informes: ${error.message}`)
  return data ?? []
}

export async function getReportById(client: TypedClient, id: string): Promise<ReportRow | null> {
  const { data, error } = await client.from('reports').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`No se pudo cargar el informe: ${error.message}`)
  return data
}

export async function createReportRecord(
  client: TypedClient,
  input: {
    organizationId: string
    personId?: string | null
    oneOnOneId?: string | null
    type: ReportType
    generatedBy: string
    storagePath: string
    params?: Json
  },
): Promise<ReportRow> {
  const { data, error } = await client
    .from('reports')
    .insert({
      organization_id: input.organizationId,
      person_id: input.personId ?? null,
      one_on_one_id: input.oneOnOneId ?? null,
      type: input.type,
      generated_by: input.generatedBy,
      storage_path: input.storagePath,
      params: input.params ?? {},
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo registrar el informe: ${error.message}`)
  return data
}
