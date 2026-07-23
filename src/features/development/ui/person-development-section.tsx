import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GoalsPanel } from './goals-panel'
import { CreateGoalDialog } from './create-goal-dialog'
import { CompetenciesPanel } from './competencies-panel'
import { AssessCompetencyDialog } from './assess-competency-dialog'
import { TrainingsPanel } from './trainings-panel'
import { CreateTrainingDialog } from './create-training-dialog'
import { CareerPlansPanel } from './career-plans-panel'
import { CreateCareerPlanDialog } from './create-career-plan-dialog'
import { FeedbackPanel } from './feedback-panel'
import { EvaluationsPanel } from './evaluations-panel'
import type { GoalCheckinRow, GoalRow } from '../infrastructure/goals.repository'
import type { CompetencyRow, PersonCompetencyRow } from '../infrastructure/competencies.repository'
import type { TrainingRow } from '../infrastructure/trainings.repository'
import type { CareerMilestoneRow, CareerPlanRow } from '../infrastructure/career-plans.repository'
import type { EvaluationRow, FeedbackEntryRow } from '../infrastructure/feedback-evaluations.repository'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'

export function PersonDevelopmentSection({
  personId,
  personName,
  people,
  goals,
  checkinsByGoal,
  competencies,
  personCompetencies,
  trainings,
  careerPlans,
  milestonesByPlan,
  feedback,
  evaluations,
}: {
  personId: string
  personName: string
  people: Pick<PersonRow, 'id' | 'first_name' | 'last_name'>[]
  goals: GoalRow[]
  checkinsByGoal: Map<string, GoalCheckinRow[]>
  competencies: CompetencyRow[]
  personCompetencies: PersonCompetencyRow[]
  trainings: TrainingRow[]
  careerPlans: CareerPlanRow[]
  milestonesByPlan: Map<string, CareerMilestoneRow[]>
  feedback: FeedbackEntryRow[]
  evaluations: EvaluationRow[]
}) {
  const selfName = new Map([[personId, personName]])

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Objetivos</CardTitle>
          <CreateGoalDialog people={people} defaultPersonId={personId} />
        </CardHeader>
        <CardContent>
          <GoalsPanel goals={goals} checkinsByGoal={checkinsByGoal} peopleNamesById={selfName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Competencias</CardTitle>
          <AssessCompetencyDialog people={people} competencies={competencies} defaultPersonId={personId} />
        </CardHeader>
        <CardContent>
          <CompetenciesPanel competencies={competencies} assessments={personCompetencies} peopleNamesById={selfName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Formación</CardTitle>
          <CreateTrainingDialog people={people} defaultPersonId={personId} />
        </CardHeader>
        <CardContent>
          <TrainingsPanel trainings={trainings} peopleNamesById={selfName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plan de carrera</CardTitle>
          <CreateCareerPlanDialog people={people} defaultPersonId={personId} />
        </CardHeader>
        <CardContent>
          <CareerPlansPanel careerPlans={careerPlans} milestonesByPlan={milestonesByPlan} peopleNamesById={selfName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackPanel feedback={feedback} personId={personId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <EvaluationsPanel evaluations={evaluations} personId={personId} />
        </CardContent>
      </Card>
    </div>
  )
}
