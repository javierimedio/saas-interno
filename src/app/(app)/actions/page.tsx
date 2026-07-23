import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { actionListFiltersSchema } from '@/features/actions/domain/action.schema'
import { listActionsGlobal } from '@/features/actions/infrastructure/actions.repository'
import { ActionFilters } from '@/features/actions/ui/action-filters'
import { ActionsKanban } from '@/features/actions/ui/actions-kanban'
import { CreateActionDialog } from '@/features/actions/ui/create-action-dialog'

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireCurrentSession()
  const supabase = await createClient()
  const raw = await searchParams

  const filters = actionListFiltersSchema.parse({
    personId: raw.personId,
    assigneeId: raw.assigneeId,
    priority: raw.priority,
    overdueOnly: raw.overdueOnly,
  })

  const [actions, people] = await Promise.all([
    listActionsGlobal(supabase, session.organizationId, filters),
    listManagerCandidates(supabase, session.organizationId),
  ])

  const peopleNamesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Acciones</h1>
          <p className="text-sm text-muted-foreground">{actions.length} acciones</p>
        </div>
        <CreateActionDialog people={people} />
      </div>
      <ActionFilters people={people} />
      <ActionsKanban actions={actions} peopleNamesById={peopleNamesById} />
    </div>
  )
}
