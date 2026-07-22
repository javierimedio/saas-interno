import { Banknote, CheckCircle2, FileText, Sparkles, UserRoundCog, UserRoundX, Video } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { groupTimelineByMonth } from '../application/build-person-timeline'
import type { PersonTimelineEvent, PersonTimelineEventType } from '../domain/timeline-event'

const ICONS: Record<PersonTimelineEventType, typeof Sparkles> = {
  hire: Sparkles,
  status_change: UserRoundX,
  field_change: UserRoundCog,
  salary_change: Banknote,
  document_added: FileText,
  one_on_one: Video,
  action_created: CheckCircle2,
  action_completed: CheckCircle2,
}

const NODE_CLASSES: Record<PersonTimelineEventType, string> = {
  hire: 'bg-muted text-muted-foreground',
  status_change: 'bg-destructive/10 text-destructive',
  field_change: 'bg-accent text-accent-foreground',
  salary_change: 'bg-warning-soft text-warning',
  document_added: 'bg-muted text-muted-foreground',
  one_on_one: 'bg-accent text-accent-foreground',
  action_created: 'bg-warning-soft text-warning',
  action_completed: 'bg-success-soft text-success',
}

export function PersonTimeline({ events }: { events: PersonTimelineEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="La historia de esta persona empieza aquí" />
  }

  const groups = groupTimelineByMonth(events)

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">{group.label}</p>
          <div className="relative flex flex-col gap-3 border-l border-border pl-6">
            {group.events.map((event) => {
              const Icon = ICONS[event.type]
              return (
                <div key={event.id} className="relative">
                  <span
                    className={`absolute -left-[31px] flex size-5 items-center justify-center rounded-full ring-4 ring-background ${NODE_CLASSES[event.type]}`}
                  >
                    <Icon className="size-3" />
                  </span>
                  <p className="text-sm font-medium">
                    {event.title}{' '}
                    <span className="font-normal text-text-faint">
                      · {new Date(event.occurredAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </p>
                  {event.detail ? <p className="text-sm text-muted-foreground">{event.detail}</p> : null}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
