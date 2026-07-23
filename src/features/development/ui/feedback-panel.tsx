import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { AddFeedbackForm } from './add-feedback-form'
import type { FeedbackEntryRow } from '../infrastructure/feedback-evaluations.repository'

export function FeedbackPanel({
  feedback,
  personId,
  peopleNamesById,
  showForm = true,
}: {
  feedback: FeedbackEntryRow[]
  personId?: string
  peopleNamesById?: Map<string, string>
  showForm?: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {feedback.length === 0 ? (
        <EmptyState title="Sin feedback registrado" />
      ) : (
        <div className="flex flex-col gap-2">
          {feedback.map((f) => (
            <div key={f.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                {peopleNamesById ? (
                  <span className="font-medium">{peopleNamesById.get(f.person_id) ?? '—'}</span>
                ) : null}
                <Badge variant={f.visibility === 'shared_with_employee' ? 'accent' : 'neutral'}>
                  {f.visibility === 'shared_with_employee' ? 'Compartido' : 'Solo admin'}
                </Badge>
              </div>
              <p className="mt-1">{f.text}</p>
              <p className="mt-1 text-xs text-text-faint">{new Date(f.created_at).toLocaleString('es-ES')}</p>
            </div>
          ))}
        </div>
      )}
      {showForm && personId ? <AddFeedbackForm personId={personId} /> : null}
    </div>
  )
}
