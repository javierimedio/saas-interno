'use server'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { getDocumentDownloadUrl } from '../infrastructure/documents.repository'

export async function getDocumentDownloadUrlAction(storagePath: string): Promise<Result<string>> {
  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const url = await getDocumentDownloadUrl(supabase, storagePath)
    return ok(url)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo generar el enlace de descarga')
  }
}
