'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { documentMetadataSchema } from '../domain/person.schema'
import { uploadDocument, deleteDocument, type DocumentRow } from '../infrastructure/documents.repository'

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024

export async function uploadDocumentAction(formData: FormData): Promise<Result<DocumentRow>> {
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return err('Selecciona un archivo')
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return err('El archivo no puede superar 15 MB')
  }

  const parsed = documentMetadataSchema.safeParse({
    personId: formData.get('personId'),
    category: formData.get('category') || undefined,
  })
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const document = await uploadDocument(supabase, session.organizationId, session.userId, file, parsed.data)
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(document)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo subir el documento')
  }
}

export async function deleteDocumentAction(document: DocumentRow): Promise<Result<null>> {
  await requireCurrentSession()
  const supabase = await createClient()

  try {
    await deleteDocument(supabase, document)
    revalidatePath(`/people/${document.person_id}`)
    return ok(null)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo eliminar el documento')
  }
}
