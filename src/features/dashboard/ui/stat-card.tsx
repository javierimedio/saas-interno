export function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'warn' | 'bad' | 'good'
}) {
  const toneClass = {
    default: '',
    warn: 'text-warning',
    bad: 'text-destructive',
    good: 'text-success',
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">{label}</p>
      <p className={`text-xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}
