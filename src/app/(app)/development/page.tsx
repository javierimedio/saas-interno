import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listGoalsGlobal, listCheckinsForGoals } from '@/features/development/infrastructure/goals.repository'
import { listCompetencies, listPersonCompetencies } from '@/features/development/infrastructure/competencies.repository'
import { listTrainingsGlobal } from '@/features/development/infrastructure/trainings.repository'
import { listCareerPlansByPerson, listMilestones } from '@/features/development/infrastructure/career-plans.repository'
import { listFeedbackByPerson, listEvaluationsByPerson } from '@/features/development/infrastructure/feedback-evaluations.repository'
import { DevelopmentTabs } from '@/features/development/ui/development-tabs'
import { GoalsPanel } from '@/features/development/ui/goals-panel'
import { CreateGoalDialog } from '@/features/development/ui/create-goal-dialog'
import { CompetenciesPanel } from '@/features/development/ui/competencies-panel'
import { CreateCompetencyDialog } from '@/features/development/ui/create-competency-dialog'
import { AssessCompetencyDialog } from '@/features/development/ui/assess-competency-dialog'
import { TrainingsPanel } from '@/features/development/ui/trainings-panel'
import { CreateTrainingDialog } from '@/features/development/ui/create-training-dialog'
import { CareerPlansPanel } from '@/features/development/ui/career-plans-panel'
import { CreateCareerPlanDialog } from '@/features/development/ui/create-career-plan-dialog'
import { FeedbackPanel } from '@/features/development/ui/feedback-panel'
import { EvaluationsPanel } from '@/features/development/ui/evaluations-panel'

export default async function DevelopmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireCurrentSession()
  const supabase = await createClient()
  const raw = await searchParams
  const tab = typeof raw.tab === 'string' ? raw.tab : 'objetivos'

  const people = await listManagerCandidates(supabase, session.organizationId)
  const peopleNamesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-lg font-semibold">Desarrollo</h1>
        <p className="text-sm text-muted-foreground">Objetivos, competencias, formación y trayectoria del equipo</p>
      </div>
      <DevelopmentTabs active={tab} />

      {tab === 'objetivos' ? (
        <ObjetivosTab supabaseOrgId={session.organizationId} peopleNamesById={peopleNamesById} people={people} />
      ) : null}
      {tab === 'competencias' ? (
        <CompetenciasTab organizationId={session.organizationId} peopleNamesById={peopleNamesById} people={people} />
      ) : null}
      {tab === 'formacion' ? (
        <FormacionTab organizationId={session.organizationId} peopleNamesById={peopleNamesById} people={people} />
      ) : null}
      {tab === 'carrera' ? <CarreraTab people={people} peopleNamesById={peopleNamesById} /> : null}
      {tab === 'feedback' ? <FeedbackTab people={people} peopleNamesById={peopleNamesById} /> : null}
      {tab === 'evaluaciones' ? <EvaluacionesTab people={people} peopleNamesById={peopleNamesById} /> : null}
    </div>
  )
}

async function ObjetivosTab({
  supabaseOrgId,
  peopleNamesById,
  people,
}: {
  supabaseOrgId: string
  peopleNamesById: Map<string, string>
  people: { id: string; first_name: string; last_name: string }[]
}) {
  const supabase = await createClient()
  const goals = await listGoalsGlobal(supabase, supabaseOrgId)
  const checkins = await listCheckinsForGoals(supabase, goals.map((g) => g.id))
  const checkinsByGoal = new Map<string, typeof checkins>()
  for (const c of checkins) {
    checkinsByGoal.set(c.goal_id, [...(checkinsByGoal.get(c.goal_id) ?? []), c])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateGoalDialog people={people} />
      </div>
      <GoalsPanel goals={goals} checkinsByGoal={checkinsByGoal} peopleNamesById={peopleNamesById} />
    </div>
  )
}

async function CompetenciasTab({
  organizationId,
  peopleNamesById,
  people,
}: {
  organizationId: string
  peopleNamesById: Map<string, string>
  people: { id: string; first_name: string; last_name: string }[]
}) {
  const supabase = await createClient()
  const competencies = await listCompetencies(supabase, organizationId)
  const assessments = (
    await Promise.all(people.map((p) => listPersonCompetencies(supabase, p.id)))
  ).flat()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2">
        <CreateCompetencyDialog />
        <AssessCompetencyDialog people={people} competencies={competencies} />
      </div>
      <CompetenciesPanel competencies={competencies} assessments={assessments} peopleNamesById={peopleNamesById} />
    </div>
  )
}

async function FormacionTab({
  organizationId,
  peopleNamesById,
  people,
}: {
  organizationId: string
  peopleNamesById: Map<string, string>
  people: { id: string; first_name: string; last_name: string }[]
}) {
  const supabase = await createClient()
  const trainings = await listTrainingsGlobal(supabase, organizationId)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateTrainingDialog people={people} />
      </div>
      <TrainingsPanel trainings={trainings} peopleNamesById={peopleNamesById} />
    </div>
  )
}

async function CarreraTab({
  people,
  peopleNamesById,
}: {
  people: { id: string; first_name: string; last_name: string }[]
  peopleNamesById: Map<string, string>
}) {
  const supabase = await createClient()
  const careerPlans = (await Promise.all(people.map((p) => listCareerPlansByPerson(supabase, p.id)))).flat()
  const milestones = await listMilestones(supabase, careerPlans.map((c) => c.id))
  const milestonesByPlan = new Map<string, typeof milestones>()
  for (const m of milestones) {
    milestonesByPlan.set(m.career_plan_id, [...(milestonesByPlan.get(m.career_plan_id) ?? []), m])
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <CreateCareerPlanDialog people={people} />
      </div>
      <CareerPlansPanel careerPlans={careerPlans} milestonesByPlan={milestonesByPlan} peopleNamesById={peopleNamesById} />
    </div>
  )
}

async function FeedbackTab({
  people,
  peopleNamesById,
}: {
  people: { id: string; first_name: string; last_name: string }[]
  peopleNamesById: Map<string, string>
}) {
  const supabase = await createClient()
  const feedback = (await Promise.all(people.map((p) => listFeedbackByPerson(supabase, p.id)))).flat()

  return <FeedbackPanel feedback={feedback} peopleNamesById={peopleNamesById} showForm={false} />
}

async function EvaluacionesTab({
  people,
  peopleNamesById,
}: {
  people: { id: string; first_name: string; last_name: string }[]
  peopleNamesById: Map<string, string>
}) {
  const supabase = await createClient()
  const evaluations = (await Promise.all(people.map((p) => listEvaluationsByPerson(supabase, p.id)))).flat()

  return <EvaluationsPanel evaluations={evaluations} peopleNamesById={peopleNamesById} showForm={false} />
}
