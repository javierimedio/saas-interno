import { calculateTenure, isSalaryReviewOverdue } from '../domain/person.rules'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'

/**
 * docs/product-design/03-employee-profile.md §3.2 define seis chips en la barra de
 * "vitals". Esta iteración solo puede alimentar los que no dependen de 1:1/acciones/
 * objetivos (verticales futuras) — el resto llega cuando existan esos módulos.
 */
export function PersonVitals({
  hireDate,
  terminationDate,
  latestSalary,
  nextMeetingAt,
  lastMeetingAt,
  lastMeetingRating,
  now,
}: {
  hireDate: string
  terminationDate: string | null
  latestSalary?: SalaryRecordRow
  nextMeetingAt?: string | null
  lastMeetingAt?: string | null
  lastMeetingRating?: number | null
  now: Date
}) {
  const overdue = latestSalary ? isSalaryReviewOverdue(latestSalary.effective_date, now) : false

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <VitalCard label="Antigüedad" value={calculateTenure(hireDate, now, terminationDate)} />
      <VitalCard
        label="Próximo 1:1"
        value={nextMeetingAt ? new Date(nextMeetingAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin programar'}
        tone={nextMeetingAt ? 'default' : 'warn'}
      />
      <VitalCard
        label="Último 1:1"
        value={
          lastMeetingAt
            ? `${new Date(lastMeetingAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}${lastMeetingRating ? ` · ${lastMeetingRating}/5` : ''}`
            : '—'
        }
      />
      <VitalCard
        label="Compensación"
        value={
          latestSalary
            ? new Date(latestSalary.effective_date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
            : '—'
        }
        tone={overdue ? 'warn' : 'default'}
      />
    </div>
  )
}

function VitalCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warn' | 'bad' | 'good' }) {
  const toneClass = {
    default: '',
    warn: 'text-warning',
    bad: 'text-destructive',
    good: 'text-success',
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-card px-3.5 py-2.5">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-text-faint">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}
