'use server'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { getReportById } from '../infrastructure/reports.repository'

export async function getReportDownloadUrlAction(reportId: string): Promise<Result<string>> {
  await requireCurrentSession()
  const supabase = await createClient()

  const report = await getReportById(supabase, reportId)
  if (!report) return err('No se encontró el informe')

  const { data, error } = await supabase.storage.from('reports').createSignedUrl(report.storage_path, 300)
  if (error || !data) return err(error?.message ?? 'No se pudo generar el enlace de descarga')

  return ok(data.signedUrl)
}
