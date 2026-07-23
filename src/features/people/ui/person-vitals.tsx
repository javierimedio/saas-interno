import { calculateTenure, isSalaryReviewOverdue } from '../domain/person.rules'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'

export function PersonVitals({
  hireDate,
  terminationDate,
  latestSalary,
  nextMeetingAt,
  lastMeetingAt,
  lastMeetingRating,
  openActionsCount,
  overdueActionsCount,
  activeGoalsCount,
  atRiskGoalsCount,
  now,
}: {
  hireDate: string
  terminationDate: string | null
  latestSalary?: SalaryRecordRow
  nextMeetingAt?: string | null
  lastMeetingAt?: string | null
  lastMeetingRating?: number | null
  openActionsCount?: number
  overdueActionsCount?: number
  activeGoalsCount?: number
  atRiskGoalsCount?: number
  now: Date
}) {
  const overdue = latestSalary ? isSalaryReviewOverdue(latestSalary.effective_date, now) : false

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
      <VitalCard
        label="Acciones"
        value={`${openActionsCount ?? 0} abiertas${overdueActionsCount ? ` · ${overdueActionsCount} vencidas` : ''}`}
        tone={overdueActionsCount ? 'bad' : 'default'}
      />
      <VitalCard
        label="Objetivos"
        value={`${activeGoalsCount ?? 0} activos${atRiskGoalsCount ? ` · ${atRiskGoalsCount} en riesgo` : ''}`}
        tone={atRiskGoalsCount ? 'warn' : 'default'}
      />
    </div>
  )
}

function VitalCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warn' | 'bad' | 'good' }) {
  const toneClass = {
    default: 'text-foreground',
    warn: 'text-warning',
    bad: 'text-destructive',
    good: 'text-success',
  }[tone]

  return (
    <div className="rounded-md border border-border bg-card px-3.5 py-2.5 shadow-nexo">
      <p className="text-nexo-label">{label}</p>
      <p className={`mt-0.5 text-[13px] font-bold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}
