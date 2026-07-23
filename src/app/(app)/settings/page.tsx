import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { listAllPeople } from '@/features/people/infrastructure/people.repository'
import { listMemberships } from '@/features/organization/infrastructure/organizations.repository'
import { OrganizationNameForm } from '@/features/organization/ui/organization-name-form'
import { DepartmentsManager } from '@/features/organization/ui/departments-manager'
import { MembersList } from '@/features/organization/ui/members-list'

export default async function SettingsPage() {
  const session = await requireAdmin()
  const supabase = await createClient()

  const [departments, people, memberships] = await Promise.all([
    listDepartments(supabase, session.organizationId),
    listAllPeople(supabase, session.organizationId),
    listMemberships(supabase, session.organizationId),
  ])

  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]))
  const personByUserId = new Map(
    people
      .filter((p) => p.user_id)
      .map((p) => [
        p.user_id as string,
        {
          name: `${p.first_name} ${p.last_name}`,
          positionTitle: p.position_title,
          departmentName: p.department_id ? departmentNameById.get(p.department_id) : undefined,
        },
      ]),
  )
  const unlinkedPeople = people
    .filter((p) => !p.user_id)
    .map((p) => ({ id: p.id, first_name: p.first_name, last_name: p.last_name, position_title: p.position_title }))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-nexo-title">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Organización</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationNameForm currentName={session.organizationName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Departamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentsManager departments={departments} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Miembros</CardTitle>
        </CardHeader>
        <CardContent>
          <MembersList memberships={memberships} personByUserId={personByUserId} unlinkedPeople={unlinkedPeople} />
        </CardContent>
      </Card>
    </div>
  )
}
