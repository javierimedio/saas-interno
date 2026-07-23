import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'

type TypedClient = SupabaseClient<Database>
export type OrganizationRow = Database['public']['Tables']['organizations']['Row']
export type MembershipRow = Database['public']['Tables']['memberships']['Row']

export async function updateOrganizationName(client: TypedClient, id: string, name: string): Promise<OrganizationRow> {
  const { data, error } = await client.from('organizations').update({ name }).eq('id', id).select('*').single()
  if (error) throw new Error(`No se pudo renombrar la organización: ${error.message}`)
  return data
}

export async function listMemberships(client: TypedClient, organizationId: string): Promise<MembershipRow[]> {
  const { data, error } = await client
    .from('memberships')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los miembros: ${error.message}`)
  return data ?? []
}
