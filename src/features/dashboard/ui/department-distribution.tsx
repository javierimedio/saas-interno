import type { DepartmentHeadcount } from '../domain/dashboard.rules'

/** Reparto del equipo activo por departamento: barras horizontales, un único color de marca. */
export function DepartmentDistribution({ data }: { data: DepartmentHeadcount[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <ul className="flex flex-col gap-3">
      {data.map((d) => (
        <li key={d.departmentName} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-[13px] text-muted-foreground" title={d.departmentName}>
            {d.departmentName}
          </span>
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-warning" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-[13px] font-semibold tabular-nums text-foreground">{d.count}</span>
        </li>
      ))}
    </ul>
  )
}
