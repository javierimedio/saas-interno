import Link from 'next/link'
import { Cake, CalendarDays, Clock, Hourglass, IdCard, Mail, Pencil, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fullName, calculateTenure, calculateAge, workingHoursLabel } from '../domain/person.rules'
import { CONTRACT_TYPE_LABELS } from '../domain/person.schema'
import { EmploymentStatusBadge } from './employment-status-badge'
import { OffboardDialog } from './offboard-dialog'
import type { PersonRow } from '../infrastructure/people.repository'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'
import type { WorkingHoursRecordRow } from '../infrastructure/working-hours-records.repository'

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function Field({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0">
        <p className="text-nexo-label">{label}</p>
        <p className="mt-0.5 break-words text-[13px] font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

/** Ficha de RRHH: toda la información esencial visible sin desplazarse. */
export function PersonHeader({
  person,
  departmentName,
  managerName,
  latestSalary,
  latestWorkingHours,
  now,
}: {
  person: PersonRow
  departmentName?: string
  managerName?: string
  latestSalary?: SalaryRecordRow
  latestWorkingHours?: WorkingHoursRecordRow
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

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border px-6 py-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field icon={IdCard} label="Código de empleado" value={person.employee_code ?? '—'} />
        <Field icon={CalendarDays} label="Fecha incorporación" value={new Date(person.hire_date).toLocaleDateString('es-ES')} />
        <Field icon={Hourglass} label="Antigüedad" value={calculateTenure(person.hire_date, now, person.termination_date)} />
        <Field
          icon={Wallet}
          label="Salario"
          value={latestSalary ? formatCurrency(Number(latestSalary.gross_annual_salary), latestSalary.currency) : '—'}
        />
        <Field icon={Mail} label="Email" value={person.email} />
        <Field
          icon={Clock}
          label={latestWorkingHours ? workingHoursLabel(latestWorkingHours.weekly_hours) : 'Jornada'}
          value={latestWorkingHours ? `${latestWorkingHours.weekly_hours} h / semana` : 'Sin registrar'}
        />
        <Field
          icon={Cake}
          label="Fecha de nacimiento"
          value={
            person.birth_date
              ? `${new Date(person.birth_date).toLocaleDateString('es-ES')} (${calculateAge(person.birth_date, now)} años)`
              : '—'
          }
        />
      </div>
    </div>
  )
}
