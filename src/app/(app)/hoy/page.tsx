import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listAllPeople } from '@/features/people/infrastructure/people.repository'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { listSalaryRecordsGlobal } from '@/features/people/infrastructure/salary-records.repository'
import {
  listOverdueMeetings,
  listRecentlyCompletedMeetings,
  listUpcomingMeetings,
} from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { listActionsGlobal } from '@/features/actions/infrastructure/actions.repository'
import {
  averageSalary,
  averageTenureYears,
  calculateAnnualPayroll,
  cumulativeSalaryIncrease,
  departmentDistribution,
  futureHires,
  groupActionsByUrgency,
  initialSalaryByPerson,
  latestSalaryByPerson,
  medianSalary,
  recentHires,
  salaryIncreaseByPerson,
  upcomingBirthdays,
  upcomingSalaryReviews,
} from '@/features/dashboard/domain/dashboard.rules'
import { StatCard } from '@/features/dashboard/ui/stat-card'
import { DepartmentDistribution } from '@/features/dashboard/ui/department-distribution'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function formatSignedCurrency(amount: number): string {
  const formatted = formatCurrency(Math.abs(amount))
  return amount >= 0 ? `+${formatted}` : `-${formatted}`
}

export default async function DashboardPage() {
  const session = await requireCurrentSession()
  if (session.role !== 'admin') {
    redirect(session.personId ? `/people/${session.personId}` : '/login')
  }
  const supabase = await createClient()
  const now = new Date()

  const [people, departments, salaryRecords, upcomingMeetings, overdueMeetings, recentMeetings, actions] = await Promise.all([
    listAllPeople(supabase, session.organizationId),
    listDepartments(supabase, session.organizationId),
    listSalaryRecordsGlobal(supabase, session.organizationId),
    listUpcomingMeetings(supabase, session.organizationId, now.toISOString(), 5),
    listOverdueMeetings(supabase, session.organizationId, now.toISOString()),
    listRecentlyCompletedMeetings(supabase, session.organizationId, 5),
    listActionsGlobal(supabase, session.organizationId, {}),
  ])

  const namesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))
  const activePeople = people.filter((p) => p.employment_status === 'active')
  const onLeavePeople = people.filter((p) => p.employment_status === 'on_leave')
  const offboardedPeople = people.filter((p) => p.employment_status === 'offboarded')

  const latestByPerson = latestSalaryByPerson(salaryRecords)
  const annualPayroll = calculateAnnualPayroll(activePeople, latestByPerson)
  const avgSalary = averageSalary(activePeople, latestByPerson)
  const medSalary = medianSalary(activePeople, latestByPerson)
  const avgTenure = averageTenureYears(activePeople, now)
  const openActions = actions.filter((a) => a.status !== 'completed' && a.status !== 'cancelled')
  const { overdue: overdueActions, dueToday: todayActions, dueThisWeek: weekActions } = groupActionsByUrgency(actions, now)

  const birthdays = upcomingBirthdays(people, now, 30)
  const salaryReviews = upcomingSalaryReviews(activePeople, latestByPerson, now)
  const recentHiresList = recentHires(people, now, 30)
  const futureHiresList = futureHires(people, now)

  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]))
  const distribution = departmentDistribution(activePeople, departmentNameById)
  const initialByPerson = initialSalaryByPerson(salaryRecords)
  const salaryIncreases = salaryIncreaseByPerson(activePeople, latestByPerson, initialByPerson)
  const totalSalaryIncrease = cumulativeSalaryIncrease(salaryIncreases)

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h1 className="text-nexo-title">Inicio</h1>
        <p className="text-nexo-subtitle mt-0.5 text-[13px] capitalize">
          {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <p className="text-nexo-label">Indicadores clave</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Personas activas" value={String(activePeople.length)} />
          <StatCard label="Masa salarial anual" value={formatCurrency(annualPayroll)} />
          <StatCard label="Salario medio" value={formatCurrency(avgSalary)} />
          <StatCard label="Mediana salarial" value={formatCurrency(medSalary)} />
          <StatCard label="Antigüedad media" value={`${avgTenure.toFixed(1)} años`} />
          <StatCard
            label="Acciones pendientes"
            value={String(openActions.length)}
            tone={overdueActions.length > 0 ? 'bad' : 'default'}
            sub={overdueActions.length > 0 ? `${overdueActions.length} vencidas` : undefined}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="text-nexo-label">Indicadores rápidos</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Empleados de baja" value={String(offboardedPeople.length)} />
          <StatCard label="Incorporaciones futuras" value={String(futureHiresList.length)} />
          <StatCard label="Excedencias" value={String(onLeavePeople.length)} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución del equipo</CardTitle>
          </CardHeader>
          <CardContent>
            {distribution.length === 0 ? (
              <EmptyState title="Sin personas activas todavía" />
            ) : (
              <DepartmentDistribution data={distribution} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incremento salarial acumulado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-[28px] leading-none font-bold tabular-nums text-foreground">
                {formatSignedCurrency(totalSalaryIncrease)}
              </p>
              <p className="text-nexo-label mt-2">Respecto al salario inicial de cada persona activa</p>
            </div>
            {salaryIncreases.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin variaciones registradas todavía.</p>
            ) : (
              <ul className="divide-y divide-border">
                {salaryIncreases.slice(0, 5).map((entry) => (
                  <li key={entry.person.id}>
                    <Link
                      href={`/people/${entry.person.id}`}
                      className="flex items-center justify-between gap-2 py-1.5 text-sm transition-colors hover:bg-secondary/50"
                    >
                      <span>
                        {entry.person.first_name} {entry.person.last_name}
                      </span>
                      <span className={`tabular-nums font-semibold ${entry.increase >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatSignedCurrency(entry.increase)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>One2One</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-faint">Próximos</p>
              {upcomingMeetings.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">Sin reuniones programadas.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {upcomingMeetings.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/one-on-ones/${m.id}`}
                        className="flex items-center justify-between gap-2 py-1.5 text-sm transition-colors hover:bg-secondary/50"
                      >
                        <span>{namesById.get(m.person_id) ?? '—'}</span>
                        <span className="tabular-nums text-text-faint">
                          {new Date(m.scheduled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {overdueMeetings.length > 0 ? (
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-destructive">Retrasados</p>
                <ul className="divide-y divide-border">
                  {overdueMeetings.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/one-on-ones/${m.id}`}
                        className="flex items-center justify-between gap-2 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/5"
                      >
                        <span>{namesById.get(m.person_id) ?? '—'}</span>
                        <span className="tabular-nums">{new Date(m.scheduled_at).toLocaleDateString('es-ES')}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-faint">Últimos realizados</p>
              {recentMeetings.length === 0 ? (
                <p className="py-2 text-sm text-muted-foreground">Sin reuniones completadas todavía.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recentMeetings.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/one-on-ones/${m.id}`}
                        className="flex items-center justify-between gap-2 py-1.5 text-sm transition-colors hover:bg-secondary/50"
                      >
                        <span>{namesById.get(m.person_id) ?? '—'}</span>
                        <span className="tabular-nums text-text-faint">
                          {new Date(m.scheduled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          {m.overall_rating ? ` · ${m.overall_rating}/5` : ''}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ActionsGroup title="Vencidas" tone="bad" actions={overdueActions} namesById={namesById} />
            <ActionsGroup title="Hoy" tone="warn" actions={todayActions} namesById={namesById} />
            <ActionsGroup title="Esta semana" tone="default" actions={weekActions} namesById={namesById} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos cumpleaños</CardTitle>
          </CardHeader>
          <CardContent>
            {birthdays.length === 0 ? (
              <EmptyState title="Sin cumpleaños en los próximos 30 días" />
            ) : (
              <ul className="divide-y divide-border">
                {birthdays.map((b) => (
                  <li key={b.person.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                    <span>
                      🎂 {b.person.first_name} {b.person.last_name}
                    </span>
                    <span className="tabular-nums text-text-faint">{b.daysUntil === 0 ? 'Hoy' : `en ${b.daysUntil} días`}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revisiones salariales</CardTitle>
          </CardHeader>
          <CardContent>
            {salaryReviews.length === 0 ? (
              <EmptyState title="Sin revisiones pendientes próximamente" />
            ) : (
              <ul className="divide-y divide-border">
                {salaryReviews.map((r) => (
                  <li key={r.person.id}>
                    <Link
                      href={`/people/${r.person.id}`}
                      className="flex items-center justify-between gap-2 py-1.5 text-sm transition-colors hover:bg-secondary/50"
                    >
                      <span>
                        {r.person.first_name} {r.person.last_name}
                      </span>
                      <Badge variant={r.monthsSince >= 18 ? 'danger' : 'warning'}>{r.monthsSince} meses</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Altas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentHiresList.length === 0 ? (
              <EmptyState title="Sin altas en los últimos 30 días" />
            ) : (
              <ul className="divide-y divide-border">
                {recentHiresList.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/people/${p.id}`}
                      className="flex items-center justify-between gap-2 py-1.5 text-sm transition-colors hover:bg-secondary/50"
                    >
                      <span>
                        {p.first_name} {p.last_name} · {p.position_title}
                      </span>
                      <span className="tabular-nums text-text-faint">{new Date(p.hire_date).toLocaleDateString('es-ES')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ActionsGroup({
  title,
  tone,
  actions,
  namesById,
}: {
  title: string
  tone: 'bad' | 'warn' | 'default'
  actions: { id: string; title: string; person_id: string; due_date: string | null }[]
  namesById: Map<string, string>
}) {
  const toneClass = { bad: 'text-destructive', warn: 'text-warning', default: 'text-text-faint' }[tone]

  return (
    <div>
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wide ${toneClass}`}>
        {title} ({actions.length})
      </p>
      {actions.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Ninguna.</p>
      ) : (
        <ul className="divide-y divide-border">
          {actions.map((a) => (
            <li key={a.id}>
              <Link
                href={`/actions/${a.id}`}
                className="flex items-center justify-between gap-2 py-1.5 text-sm transition-colors hover:bg-secondary/50"
              >
                <span>{a.title}</span>
                <span className="text-text-faint">{namesById.get(a.person_id) ?? '—'}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
