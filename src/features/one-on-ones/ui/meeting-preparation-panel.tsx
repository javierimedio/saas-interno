'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ActionPriorityBadge } from '@/features/actions/ui/action-priority-badge'
import { SPECIAL_BLOCKS } from '../domain/one-on-one-templates'
import type { MeetingPreparationData } from '../application/get-meeting-preparation'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)
}

export function MeetingPreparationPanel({ data }: { data: MeetingPreparationData }) {
  const [open, setOpen] = React.useState(false)

  const summaryParts = [
    `${data.openActions.length} acción${data.openActions.length === 1 ? '' : 'es'} abierta${data.openActions.length === 1 ? '' : 's'}`,
    `${data.salaryChanges.length} cambio${data.salaryChanges.length === 1 ? '' : 's'} salarial${data.salaryChanges.length === 1 ? '' : 'es'}`,
    `${data.workingHoursChanges.length} cambio${data.workingHoursChanges.length === 1 ? '' : 's'} de jornada`,
    `${data.recentDocuments.length} documento${data.recentDocuments.length === 1 ? '' : 's'} nuevo${data.recentDocuments.length === 1 ? '' : 's'}`,
    `${data.privateNotes.length} nota${data.privateNotes.length === 1 ? '' : 's'} privada${data.privateNotes.length === 1 ? '' : 's'}`,
  ]

  const hasNothing =
    data.openActions.length === 0 &&
    data.salaryChanges.length === 0 &&
    data.workingHoursChanges.length === 0 &&
    data.recentDocuments.length === 0 &&
    data.privateNotes.length === 0

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left">
          <div>
            <span className="text-[13px] font-bold">{SPECIAL_BLOCKS.preparation.title}</span>
            <p className="mt-1 text-xs text-muted-foreground">{SPECIAL_BLOCKS.preparation.description}</p>
            <p className="mt-2 text-sm">
              {hasNothing
                ? `Sin novedades desde ${data.sinceDate ? formatDate(data.sinceDate) : 'hace 6 meses'}.`
                : summaryParts.join(' · ')}
            </p>
          </div>
          <ChevronDown className={cn('mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t border-border px-5 py-4 text-sm">
            <PreparationSection title="Acciones abiertas" empty="Sin acciones abiertas">
              {data.openActions.map((action) => (
                <li key={action.id} className="flex items-center justify-between gap-2">
                  <span>{action.title}</span>
                  <ActionPriorityBadge priority={action.priority} />
                </li>
              ))}
            </PreparationSection>

            <PreparationSection title="Cambios salariales" empty="Sin cambios salariales">
              {data.salaryChanges.map((record) => (
                <li key={record.id} className="flex items-center justify-between gap-2">
                  <span>{record.reason}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(record.gross_annual_salary, record.currency)} · {formatDate(record.effective_date)}
                  </span>
                </li>
              ))}
            </PreparationSection>

            <PreparationSection title="Cambios de jornada" empty="Sin cambios de jornada">
              {data.workingHoursChanges.map((record) => (
                <li key={record.id} className="flex items-center justify-between gap-2">
                  <span>{record.reason}</span>
                  <span className="text-muted-foreground">
                    {record.weekly_hours}h/sem · {formatDate(record.effective_date)}
                  </span>
                </li>
              ))}
            </PreparationSection>

            <PreparationSection title="Documentos recientes" empty="Sin documentos recientes">
              {data.recentDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-2">
                  <span>{doc.file_name}</span>
                  <Badge variant="neutral">{doc.category}</Badge>
                </li>
              ))}
            </PreparationSection>

            <PreparationSection title="Notas privadas" empty="Sin notas privadas">
              {data.privateNotes.map((note) => (
                <li key={note.id} className="flex flex-col gap-0.5">
                  <span>{note.note}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
                </li>
              ))}
            </PreparationSection>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

function PreparationSection({
  title,
  empty,
  children,
}: {
  title: string
  empty: string
  children: React.ReactNode
}) {
  const items = React.Children.toArray(children)

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1">{children}</ul>
      )}
    </div>
  )
}
