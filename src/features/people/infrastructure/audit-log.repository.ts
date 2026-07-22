import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'

type TypedClient = SupabaseClient<Database>
export type AuditLogRow = Database['public']['Tables']['audit_log']['Row']

/**
 * Fuente de la Cronología de esta iteración (docs/product-design/09-future-roadmap.md §9.1:
 * hasta que existan 1:1/acciones/objetivos, el historial de una persona se construye a
 * partir de audit_log + salary_records + documents).
 */
export async function listAuditEventsForPerson(client: TypedClient, personId: string): Promise<AuditLogRow[]> {
  const { data, error } = await client
    .from('audit_log')
    .select('*')
    .eq('entity_type', 'people')
    .eq('entity_id', personId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`No se pudo cargar el historial: ${error.message}`)
  }

  return data ?? []
}
