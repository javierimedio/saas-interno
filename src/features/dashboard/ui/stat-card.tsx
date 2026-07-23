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
    default: 'text-foreground',
    warn: 'text-warning',
    bad: 'text-destructive',
    good: 'text-success',
  }[tone]

  return (
    <div className="rounded-md border border-border bg-card px-5 py-4 shadow-nexo">
      <p className={`text-[28px] leading-none font-bold tabular-nums ${toneClass}`}>{value}</p>
      <p className="text-nexo-label mt-2">{label}</p>
      {sub ? <p className="mt-1 text-[12px] text-muted-foreground">{sub}</p> : null}
    </div>
  )
}
