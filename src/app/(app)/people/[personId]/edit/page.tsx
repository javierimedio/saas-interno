import { notFound } from 'next/navigation'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { getPersonById, listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { PersonEditForm } from '@/features/people/ui/person-edit-form'

export default async function EditPersonPage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params
  const session = await requireAdmin()
  const supabase = await createClient()

  const person = await getPersonById(supabase, personId)
  if (!person) {
    notFound()
  }

  const [departments, managerCandidates] = await Promise.all([
    listDepartments(supabase, session.organizationId),
    listManagerCandidates(supabase, session.organizationId, person.id),
  ])

  return (
    <div className="flex flex-col gap-5 p-6">
      <h1 className="text-lg font-semibold">Editar persona</h1>
      <PersonEditForm person={person} departments={departments} managerCandidates={managerCandidates} />
    </div>
  )
}
