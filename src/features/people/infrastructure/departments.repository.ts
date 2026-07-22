import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'

type TypedClient = SupabaseClient<Database>
export type DepartmentRow = Database['public']['Tables']['departments']['Row']

export async function listDepartments(client: TypedClient, organizationId: string): Promise<DepartmentRow[]> {
  const { data, error } = await client
    .from('departments')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`No se pudieron cargar los departamentos: ${error.message}`)
  }

  return data ?? []
}

export async function createDepartment(
  client: TypedClient,
  organizationId: string,
  name: string,
): Promise<DepartmentRow> {
  const { data, error } = await client
    .from('departments')
    .insert({ organization_id: organizationId, name })
    .select('*')
    .single()

  if (error) {
    throw new Error(`No se pudo crear el departamento: ${error.message}`)
  }

  return data
}
