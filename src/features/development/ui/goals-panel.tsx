import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { latestProgress } from '../domain/goal.rules'
import { GoalStatusBadge } from './goal-status-badge'
import { GoalStatusControl } from './goal-status-control'
import { GoalCheckinForm } from './goal-checkin-form'
import type { GoalCheckinRow, GoalRow } from '../infrastructure/goals.repository'

export function GoalsPanel({
  goals,
  checkinsByGoal,
  peopleNamesById,
}: {
  goals: GoalRow[]
  checkinsByGoal: Map<string, GoalCheckinRow[]>
  peopleNamesById: Map<string, string>
}) {
  if (goals.length === 0) {
    return <EmptyState title="Sin objetivos todavía" description="Crea el primer objetivo para empezar a hacer seguimiento." />
  }

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => {
        const checkins = checkinsByGoal.get(goal.id) ?? []
        const progress = latestProgress(checkins)
        return (
          <Card key={goal.id}>
            <CardContent className="flex flex-col gap-3 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {peopleNamesById.get(goal.person_id) ?? '—'} · {goal.year}
                    {goal.category ? ` · ${goal.category}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <GoalStatusBadge status={goal.status} />
                  <GoalStatusControl goalId={goal.id} status={goal.status} />
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-accent-foreground" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-faint">{progress}% de avance · {checkins.length} checkpoints</span>
                <GoalCheckinForm goalId={goal.id} latestProgress={progress} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
