import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'

type TypedClient = SupabaseClient<Database>
export type AgreementRow = Database['public']['Tables']['one_on_one_agreements']['Row']

export async function listAgreements(client: TypedClient, oneOnOneId: string): Promise<AgreementRow[]> {
  const { data, error } = await client
    .from('one_on_one_agreements')
    .select('*')
    .eq('one_on_one_id', oneOnOneId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los acuerdos: ${error.message}`)
  return data ?? []
}

export async function addAgreement(
  client: TypedClient,
  oneOnOneId: string,
  createdBy: string,
  description: string,
): Promise<AgreementRow> {
  const { data, error } = await client
    .from('one_on_one_agreements')
    .insert({ one_on_one_id: oneOnOneId, description, created_by: createdBy })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo guardar el acuerdo: ${error.message}`)
  return data
}
