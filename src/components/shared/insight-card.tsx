import { cn } from '@/lib/utils'

/** docs/product-design/04-dashboard.md §4.2: severidad en forma (franja de color), no solo en texto. */
export function InsightCard({
  severity = 'neutral',
  headline,
  sub,
  action,
}: {
  severity?: 'neutral' | 'warning' | 'danger' | 'success'
  headline: string
  sub?: string
  action?: React.ReactNode
}) {
  const borderClass = {
    neutral: 'border-l-border',
    warning: 'border-l-warning',
    danger: 'border-l-destructive',
    success: 'border-l-success',
  }[severity]

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border border-border border-l-[3px] bg-card px-4 py-3', borderClass)}>
      <div className="flex-1">
        <p className="text-sm font-medium">{headline}</p>
        {sub ? <p className="mt-0.5 text-xs text-text-faint">{sub}</p> : null}
        {action ? <div className="mt-2.5">{action}</div> : null}
      </div>
    </div>
  )
}
