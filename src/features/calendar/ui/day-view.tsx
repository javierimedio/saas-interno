import Link from 'next/link'

import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { MeetingStatusBadge } from '@/features/one-on-ones/ui/meeting-status-badge'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'

export function DayView({
  meetings,
  peopleNamesById,
}: {
  meetings: OneOnOneRow[]
  peopleNamesById: Map<string, string>
}) {
  const sorted = [...meetings].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  if (sorted.length === 0) {
    return <EmptyState title="Sin reuniones este día" />
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {sorted.map((meeting) => {
        const name = peopleNamesById.get(meeting.person_id) ?? '—'
        return (
          <Link
            key={meeting.id}
            href={`/one-on-ones/${meeting.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50"
          >
            <span className="w-14 shrink-0 text-sm font-semibold tabular-nums">
              {new Date(meeting.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Avatar name={name} size="sm" />
            <span className="flex-1 text-sm font-medium">{name}</span>
            <MeetingStatusBadge status={meeting.status} />
          </Link>
        )
      })}
    </div>
  )
}
