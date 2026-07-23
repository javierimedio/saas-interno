import Link from 'next/link'

import { cn } from '@/lib/utils'

const TABS = [
  { key: 'objetivos', label: 'Objetivos' },
  { key: 'competencias', label: 'Competencias' },
  { key: 'formacion', label: 'Formación' },
  { key: 'carrera', label: 'Plan de carrera' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'evaluaciones', label: 'Evaluaciones' },
] as const

export function DevelopmentTabs({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/development?tab=${tab.key}`}
          className={cn(
            'rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors',
            active === tab.key
              ? 'border-b-2 border-accent-foreground text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
