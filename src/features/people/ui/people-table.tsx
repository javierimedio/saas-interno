'use client'

import Link from 'next/link'

import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { fullName, calculateTenure, salaryReviewRecency } from '../domain/person.rules'
import { EmploymentStatusBadge } from './employment-status-badge'
import { PeopleColumnPicker, usePeopleColumns, type PeopleColumnKey } from './people-column-picker'
import type { PersonListRow } from '../domain/people-list.rules'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

const RECENCY_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  recent: { label: 'Reciente', variant: 'success' },
  over_12: { label: '+12 meses', variant: 'warning' },
  over_18: { label: '+18 meses', variant: 'danger' },
}

export function PeopleTable({ rows, now, userKey }: { rows: PersonListRow[]; now: Date; userKey: string }) {
  const { visible, toggle } = usePeopleColumns(userKey)
  const show = (key: PeopleColumnKey) => visible.has(key)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end">
        <PeopleColumnPicker visible={visible} onToggle={toggle} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin personas que coincidan con los filtros"
          description="Prueba a cambiar la búsqueda o los filtros aplicados."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Persona</TableHead>
              {show('code') ? <TableHead>Código</TableHead> : null}
              {show('position') ? <TableHead>Puesto</TableHead> : null}
              {show('department') ? <TableHead>Departamento</TableHead> : null}
              {show('manager') ? <TableHead>Responsable</TableHead> : null}
              {show('status') ? <TableHead>Estado</TableHead> : null}
              {show('tenure') ? <TableHead>Antigüedad</TableHead> : null}
              {show('salary') ? <TableHead>Salario</TableHead> : null}
              {show('lastReview') ? <TableHead>Última revisión</TableHead> : null}
              {show('workingHours') ? <TableHead>Jornada</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ person, departmentName, managerName, latestSalary, latestWorkingHours }) => {
              const name = fullName({ firstName: person.first_name, lastName: person.last_name })
              const recency = latestSalary ? RECENCY_BADGE[salaryReviewRecency(latestSalary.effective_date, now)] : undefined

              return (
                <TableRow key={person.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/people/${person.id}`} className="flex items-center gap-2.5 font-medium">
                      <Avatar name={name} size="sm" />
                      {name}
                    </Link>
                  </TableCell>
                  {show('code') ? <TableCell className="text-muted-foreground">{person.employee_code ?? '—'}</TableCell> : null}
                  {show('position') ? <TableCell className="text-muted-foreground">{person.position_title}</TableCell> : null}
                  {show('department') ? <TableCell className="text-muted-foreground">{departmentName ?? '—'}</TableCell> : null}
                  {show('manager') ? <TableCell className="text-muted-foreground">{managerName ?? '—'}</TableCell> : null}
                  {show('status') ? (
                    <TableCell>
                      <EmploymentStatusBadge status={person.employment_status} />
                    </TableCell>
                  ) : null}
                  {show('tenure') ? (
                    <TableCell className="tabular-nums text-muted-foreground">
                      {calculateTenure(person.hire_date, now, person.termination_date)}
                    </TableCell>
                  ) : null}
                  {show('salary') ? (
                    <TableCell className="tabular-nums font-medium">
                      {latestSalary ? formatCurrency(Number(latestSalary.gross_annual_salary)) : '—'}
                    </TableCell>
                  ) : null}
                  {show('lastReview') ? (
                    <TableCell className="tabular-nums text-muted-foreground">
                      {latestSalary ? (
                        <span className="flex items-center gap-1.5">
                          {new Date(latestSalary.effective_date).toLocaleDateString('es-ES')}
                          {recency ? <Badge variant={recency.variant}>{recency.label}</Badge> : null}
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  ) : null}
                  {show('workingHours') ? (
                    <TableCell className="tabular-nums text-muted-foreground">
                      {latestWorkingHours ? `${latestWorkingHours.weekly_hours} h/sem` : '—'}
                    </TableCell>
                  ) : null}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
