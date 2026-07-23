'use client'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { REPORT_TYPE_LABELS } from '../domain/report.schema'
import { getReportDownloadUrlAction } from '../application/get-report-download-url.action'
import type { ReportRow } from '../infrastructure/reports.repository'

export function ReportsList({
  reports,
  peopleNamesById,
}: {
  reports: ReportRow[]
  peopleNamesById?: Map<string, string>
}) {
  async function handleDownload(reportId: string) {
    const result = await getReportDownloadUrlAction(reportId)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    window.open(result.data, '_blank', 'noopener,noreferrer')
  }

  if (reports.length === 0) {
    return <EmptyState title="Sin informes generados" />
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {reports.map((report) => (
        <div key={report.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <div>
            <p className="font-medium">{REPORT_TYPE_LABELS[report.type] ?? report.type}</p>
            <p className="text-xs text-text-faint">
              {peopleNamesById && report.person_id ? `${peopleNamesById.get(report.person_id) ?? '—'} · ` : ''}
              {new Date(report.generated_at).toLocaleString('es-ES')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => handleDownload(report.id)}>
            Descargar
          </Button>
        </div>
      ))}
    </div>
  )
}
