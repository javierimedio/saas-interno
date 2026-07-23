import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listReportsGlobal } from '@/features/reports/infrastructure/reports.repository'
import { CreateReportDialog } from '@/features/reports/ui/create-report-dialog'
import { ReportsList } from '@/features/reports/ui/reports-list'

export default async function ReportsPage() {
  const session = await requireCurrentSession()
  const supabase = await createClient()

  const [reports, people] = await Promise.all([
    listReportsGlobal(supabase, session.organizationId),
    listManagerCandidates(supabase, session.organizationId),
  ])

  const peopleNamesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Informes</h1>
          <p className="text-sm text-muted-foreground">{reports.length} informes generados</p>
        </div>
        <CreateReportDialog people={people} />
      </div>
      <ReportsList reports={reports} peopleNamesById={peopleNamesById} />
    </div>
  )
}
