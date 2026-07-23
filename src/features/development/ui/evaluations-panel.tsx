import { EmptyState } from '@/components/shared/empty-state'
import { AddEvaluationForm } from './add-evaluation-form'
import type { EvaluationRow } from '../infrastructure/feedback-evaluations.repository'

export function EvaluationsPanel({
  evaluations,
  personId,
  peopleNamesById,
  showForm = true,
}: {
  evaluations: EvaluationRow[]
  personId?: string
  peopleNamesById?: Map<string, string>
  showForm?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {evaluations.length === 0 ? (
        <EmptyState title="Sin evaluaciones registradas" />
      ) : (
        <div className="flex flex-col gap-2">
          {evaluations.map((e) => (
            <div key={e.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {peopleNamesById ? `${peopleNamesById.get(e.person_id) ?? '—'} · ` : ''}
                  {e.period}
                </span>
                <span className="text-sm">{e.result}</span>
              </div>
              {e.notes ? <p className="mt-1 text-muted-foreground">{e.notes}</p> : null}
              <p className="mt-1 text-xs text-text-faint">{new Date(e.created_at).toLocaleDateString('es-ES')}</p>
            </div>
          ))}
        </div>
      )}
      {showForm && personId ? <AddEvaluationForm personId={personId} /> : null}
    </div>
  )
}
