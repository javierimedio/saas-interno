import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/pagination'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { peopleListFiltersSchema } from '@/features/people/domain/person.schema'
import { getPeopleNamesByIds, listPeople } from '@/features/people/infrastructure/people.repository'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { PeopleFilters } from '@/features/people/ui/people-filters'
import { PeopleTable } from '@/features/people/ui/people-table'

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireAdmin()
  const supabase = await createClient()

  const rawParams = await searchParams
  const filters = peopleListFiltersSchema.parse({
    q: rawParams.q,
    departmentId: rawParams.departmentId,
    status: rawParams.status,
    page: rawParams.page,
  })

  const [{ people, total, page, pageSize }, departments] = await Promise.all([
    listPeople(supabase, session.organizationId, filters),
    listDepartments(supabase, session.organizationId),
  ])

  const managerIds = Array.from(new Set(people.map((p) => p.manager_id).filter((id): id is string => !!id)))
  const managers = await getPeopleNamesByIds(supabase, managerIds)

  const departmentsById = new Map(departments.map((d) => [d.id, d]))
  const managerNamesById = new Map(managers.map((m) => [m.id, `${m.first_name} ${m.last_name}`]))

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.departmentId) params.set('departmentId', filters.departmentId)
    if (filters.status) params.set('status', filters.status)
    params.set('page', String(targetPage))
    return `/people?${params.toString()}`
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-nexo-title">Personas</h1>
          <p className="text-sm text-muted-foreground">{total} personas en tu organización</p>
        </div>
        <Button asChild>
          <Link href="/people/new">
            <Plus />
            Nueva persona
          </Link>
        </Button>
      </div>

      <PeopleFilters departments={departments} />

      <PeopleTable
        people={people}
        departmentsById={departmentsById}
        managerNamesById={managerNamesById}
        now={new Date()}
      />

      <Pagination page={page} pageSize={pageSize} total={total} buildHref={buildHref} />
    </div>
  )
}
