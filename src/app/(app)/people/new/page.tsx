import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { PersonCreateForm } from '@/features/people/ui/person-create-form'

export default async function NewPersonPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  const [departments, managerCandidates] = await Promise.all([
    listDepartments(supabase, session.organizationId),
    listManagerCandidates(supabase, session.organizationId),
  ])

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-lg font-semibold">Nueva persona</h1>
        <p className="text-sm text-muted-foreground">
          El alta registra también su salario inicial — no se puede guardar sin él.
        </p>
      </div>
      <PersonCreateForm departments={departments} managerCandidates={managerCandidates} />
    </div>
  )
}
