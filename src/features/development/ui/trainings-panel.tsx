import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { TrainingStatusControl } from './training-status-control'
import type { TrainingRow } from '../infrastructure/trainings.repository'

export function TrainingsPanel({
  trainings,
  peopleNamesById,
}: {
  trainings: TrainingRow[]
  peopleNamesById: Map<string, string>
}) {
  if (trainings.length === 0) {
    return <EmptyState title="Sin formaciones registradas" description="Añade la primera formación para hacer seguimiento." />
  }

  return (
    <div className="flex flex-col gap-3">
      {trainings.map((training) => (
        <Card key={training.id}>
          <CardContent className="flex items-center justify-between gap-3 pt-5">
            <div>
              <p className="font-medium">{training.title}</p>
              <p className="text-sm text-muted-foreground">
                {peopleNamesById.get(training.person_id) ?? '—'}
                {training.provider ? ` · ${training.provider}` : ''}
                {training.start_date ? ` · ${new Date(training.start_date).toLocaleDateString('es-ES')}` : ''}
              </p>
            </div>
            <TrainingStatusControl trainingId={training.id} status={training.status} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
