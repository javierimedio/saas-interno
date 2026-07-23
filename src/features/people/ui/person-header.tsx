import Link from 'next/link'
import { Pencil } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fullName, calculateTenure } from '../domain/person.rules'
import { CONTRACT_TYPE_LABELS } from '../domain/person.schema'
import { EmploymentStatusBadge } from './employment-status-badge'
import { OffboardDialog } from './offboard-dialog'
import type { PersonRow } from '../infrastructure/people.repository'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-nexo-label">{label}</p>
      <p className="mt-0.5 text-[13px] font-semibold text-foreground">{value}</p>
    </div>
  )
}

/** Ficha de RRHH: toda la información esencial visible sin desplazarse. */
export function PersonHeader({
  person,
  departmentName,
  managerName,
  latestSalary,
  now,
}: {
  person: PersonRow
  departmentName?: string
  managerName?: string
  latestSalary?: SalaryRecordRow
  now: Date
}) {
  const name = fullName({ firstName: person.first_name, lastName: person.last_name })

  return (
    <div className="rounded-md border border-border bg-card shadow-nexo">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar name={name} size="xl" src={person.avatar_url} />
          <div>
            <h1 className="text-xl font-bold text-foreground">{name}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {person.position_title}
              {departmentName ? ` · ${departmentName}` : ''}
            </p>
            {managerName ? <p className="mt-0.5 text-[13px] text-muted-foreground">Responsable: {managerName}</p> : null}
            <div className="mt-2.5 flex items-center gap-1.5">
              <EmploymentStatusBadge status={person.employment_status} />
              <Badge variant="outline">{CONTRACT_TYPE_LABELS[person.contract_type]}</Badge>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/people/${person.id}/edit`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          {person.employment_status !== 'offboarded' ? (
            <OffboardDialog personId={person.id} personName={name} />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border px-6 py-4 sm:grid-cols-4">
        <Field label="Fecha incorporación" value={new Date(person.hire_date).toLocaleDateString('es-ES')} />
        <Field label="Antigüedad" value={calculateTenure(person.hire_date, now, person.termination_date)} />
        <Field
          label="Salario"
          value={latestSalary ? formatCurrency(Number(latestSalary.gross_annual_salary), latestSalary.currency) : '—'}
        />
        <Field label="Email" value={person.email} />
      </div>
    </div>
  )
}
