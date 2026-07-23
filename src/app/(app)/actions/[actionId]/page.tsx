import { notFound } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { getPersonById, listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { getActionById, listActionComments } from '@/features/actions/infrastructure/actions.repository'
import { ActionStatusBadge } from '@/features/actions/ui/action-status-badge'
import { ActionStatusControl } from '@/features/actions/ui/action-status-control'
import { ActionEditForm } from '@/features/actions/ui/action-edit-form'
import { ActionCommentsPanel } from '@/features/actions/ui/action-comments-panel'

export default async function ActionDetailPage({ params }: { params: Promise<{ actionId: string }> }) {
  const { actionId } = await params
  const session = await requireCurrentSession()
  const supabase = await createClient()

  const action = await getActionById(supabase, actionId)
  if (!action) notFound()

  const [person, comments, people] = await Promise.all([
    getPersonById(supabase, action.person_id),
    listActionComments(supabase, action.id),
    listManagerCandidates(supabase, session.organizationId),
  ])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-nexo-title">{action.title}</h1>
          <p className="text-sm text-muted-foreground">Sobre {person ? `${person.first_name} ${person.last_name}` : '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionStatusBadge status={action.status} />
          <ActionStatusControl actionId={action.id} status={action.status} />
        </div>
      </div>

      {action.status === 'blocked' && action.blocked_reason ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          Bloqueada: {action.blocked_reason}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionEditForm action={action} people={people} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comentarios</CardTitle>
        </CardHeader>
        <CardContent>
          <ActionCommentsPanel actionId={action.id} comments={comments} />
        </CardContent>
      </Card>
    </div>
  )
}
