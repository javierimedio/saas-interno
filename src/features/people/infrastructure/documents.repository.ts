import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { DocumentMetadataInput } from '../domain/person.schema'

type TypedClient = SupabaseClient<Database>
export type DocumentRow = Database['public']['Tables']['documents']['Row']

export const DOCUMENTS_BUCKET = 'documents'

/**
 * La ruta de almacenamiento sigue organization_id/person_id/... para que las políticas de
 * Storage (supabase/migrations/20260722120600_storage.sql) puedan aplicar el mismo alcance
 * que la tabla `documents` usando storage.foldername(name).
 */
function buildStoragePath(organizationId: string, personId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${organizationId}/${personId}/${Date.now()}-${safeName}`
}

export async function listDocuments(client: TypedClient, personId: string): Promise<DocumentRow[]> {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`No se pudieron cargar los documentos: ${error.message}`)
  }

  return data ?? []
}

export async function uploadDocument(
  client: TypedClient,
  organizationId: string,
  userId: string,
  file: File,
  metadata: DocumentMetadataInput,
): Promise<DocumentRow> {
  const storagePath = buildStoragePath(organizationId, metadata.personId, file.name)

  const { error: uploadError } = await client.storage.from(DOCUMENTS_BUCKET).upload(storagePath, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })

  if (uploadError) {
    throw new Error(`No se pudo subir el archivo: ${uploadError.message}`)
  }

  const { data, error } = await client
    .from('documents')
    .insert({
      organization_id: organizationId,
      person_id: metadata.personId,
      uploaded_by: userId,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
      category: metadata.category,
    })
    .select('*')
    .single()

  if (error) {
    await client.storage.from(DOCUMENTS_BUCKET).remove([storagePath])
    throw new Error(`No se pudo registrar el documento: ${error.message}`)
  }

  return data
}

export async function deleteDocument(client: TypedClient, document: DocumentRow): Promise<void> {
  const { error: dbError } = await client.from('documents').delete().eq('id', document.id)
  if (dbError) {
    throw new Error(`No se pudo eliminar el documento: ${dbError.message}`)
  }

  await client.storage.from(DOCUMENTS_BUCKET).remove([document.storage_path])
}

export async function getDocumentDownloadUrl(client: TypedClient, storagePath: string): Promise<string> {
  const { data, error } = await client.storage.from(DOCUMENTS_BUCKET).createSignedUrl(storagePath, 60)

  if (error || !data) {
    throw new Error('No se pudo generar el enlace de descarga')
  }

  return data.signedUrl
}
