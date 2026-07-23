import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { AddMilestoneForm } from './add-milestone-form'
import type { CareerMilestoneRow, CareerPlanRow } from '../infrastructure/career-plans.repository'

export function CareerPlansPanel({
  careerPlans,
  milestonesByPlan,
  peopleNamesById,
}: {
  careerPlans: CareerPlanRow[]
  milestonesByPlan: Map<string, CareerMilestoneRow[]>
  peopleNamesById: Map<string, string>
}) {
  if (careerPlans.length === 0) {
    return <EmptyState title="Sin planes de carrera" description="Crea un plan de carrera para empezar a definir hitos." />
  }

  return (
    <div className="flex flex-col gap-3">
      {careerPlans.map((plan) => {
        const milestones = milestonesByPlan.get(plan.id) ?? []
        return (
          <Card key={plan.id}>
            <CardContent className="flex flex-col gap-3 pt-5">
              <div>
                <p className="font-medium">{plan.target_position}</p>
                <p className="text-sm text-muted-foreground">{peopleNamesById.get(plan.person_id) ?? '—'}</p>
                {plan.notes ? <p className="mt-1 text-sm text-muted-foreground">{plan.notes}</p> : null}
              </div>
              {milestones.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {milestones.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className={m.completed_at ? 'text-text-faint line-through' : ''}>{m.title}</span>
                      <div className="flex items-center gap-2">
                        {m.target_date ? (
                          <span className="text-xs text-text-faint">{new Date(m.target_date).toLocaleDateString('es-ES')}</span>
                        ) : null}
                        {m.completed_at ? <Badge variant="success">Completado</Badge> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <AddMilestoneForm careerPlanId={plan.id} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
