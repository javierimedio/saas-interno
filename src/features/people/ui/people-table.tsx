import Link from 'next/link'

import { Avatar } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { fullName, calculateTenure } from '../domain/person.rules'
import { EmploymentStatusBadge } from './employment-status-badge'
import type { PersonRow } from '../infrastructure/people.repository'
import type { DepartmentRow } from '../infrastructure/departments.repository'

export function PeopleTable({
  people,
  departmentsById,
  managerNamesById,
  now,
}: {
  people: PersonRow[]
  departmentsById: Map<string, DepartmentRow>
  managerNamesById: Map<string, string>
  now: Date
}) {
  if (people.length === 0) {
    return (
      <EmptyState
        title="No hay personas que coincidan con los filtros"
        description="Prueba a cambiar la búsqueda o los filtros aplicados."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Persona</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Puesto</TableHead>
          <TableHead>Departamento</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Antigüedad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => {
          const name = fullName({ firstName: person.first_name, lastName: person.last_name })
          const department = person.department_id ? departmentsById.get(person.department_id) : undefined
          const managerName = person.manager_id ? managerNamesById.get(person.manager_id) : undefined

          return (
            <TableRow key={person.id} className="cursor-pointer">
              <TableCell>
                <Link href={`/people/${person.id}`} className="flex items-center gap-2.5 font-medium">
                  <Avatar name={name} size="sm" />
                  {name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{person.employee_code ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{person.position_title}</TableCell>
              <TableCell className="text-muted-foreground">{department?.name ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground">{managerName ?? '—'}</TableCell>
              <TableCell>
                <EmploymentStatusBadge status={person.employment_status} />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {calculateTenure(person.hire_date, now, person.termination_date)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
