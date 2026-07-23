import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/pagination'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { peopleListFiltersSchema } from '@/features/people/domain/person.schema'
import { listAllPeople, listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { listSalaryRecordsGlobal } from '@/features/people/infrastructure/salary-records.repository'
import { listWorkingHoursRecordsGlobal } from '@/features/people/infrastructure/working-hours-records.repository'
import { latestSalaryByPerson, latestWorkingHoursByPerson } from '@/features/dashboard/domain/dashboard.rules'
import { buildPeopleListRows, filterPeopleListRows, sortPeopleListRows } from '@/features/people/domain/people-list.rules'
import { PeopleFilters } from '@/features/people/ui/people-filters'
import { PeopleTable } from '@/features/people/ui/people-table'

const PAGE_SIZE = 20

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
    managerId: rawParams.managerId,
    minSalary: rawParams.minSalary,
    maxSalary: rawParams.maxSalary,
    jornada: rawParams.jornada,
    minTenureYears: rawParams.minTenureYears,
    maxTenureYears: rawParams.maxTenureYears,
    sortBy: rawParams.sortBy,
    sortDir: rawParams.sortDir,
    page: rawParams.page,
  })

  const [people, departments, managerCandidates, salaryRecords, workingHoursRecords] = await Promise.all([
    listAllPeople(supabase, session.organizationId),
    listDepartments(supabase, session.organizationId),
    listManagerCandidates(supabase, session.organizationId),
    listSalaryRecordsGlobal(supabase, session.organizationId),
    listWorkingHoursRecordsGlobal(supabase, session.organizationId),
  ])

  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]))
  const managerNameById = new Map(managerCandidates.map((m) => [m.id, `${m.first_name} ${m.last_name}`]))
  const now = new Date()

  const allRows = buildPeopleListRows(
    people,
    latestSalaryByPerson(salaryRecords),
    latestWorkingHoursByPerson(workingHoursRecords),
    departmentNameById,
    managerNameById,
    now,
  )
  const filteredRows = filterPeopleListRows(allRows, filters)
  const sortedRows = sortPeopleListRows(filteredRows, filters.sortBy, filters.sortDir)

  const total = sortedRows.length
  const page = filters.page
  const from = (page - 1) * PAGE_SIZE
  const pageRows = sortedRows.slice(from, from + PAGE_SIZE)

  function buildHref(targetPage: number) {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.departmentId) params.set('departmentId', filters.departmentId)
    if (filters.status) params.set('status', filters.status)
    if (filters.managerId) params.set('managerId', filters.managerId)
    if (filters.minSalary != null) params.set('minSalary', String(filters.minSalary))
    if (filters.maxSalary != null) params.set('maxSalary', String(filters.maxSalary))
    if (filters.jornada) params.set('jornada', filters.jornada)
    if (filters.minTenureYears != null) params.set('minTenureYears', String(filters.minTenureYears))
    if (filters.maxTenureYears != null) params.set('maxTenureYears', String(filters.maxTenureYears))
    if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy)
    if (filters.sortDir !== 'asc') params.set('sortDir', filters.sortDir)
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

      <PeopleFilters departments={departments} managers={managerCandidates} />

      <PeopleTable rows={pageRows} now={now} userKey={session.email} />

      <Pagination page={page} pageSize={PAGE_SIZE} total={total} buildHref={buildHref} />
    </div>
  )
}
