import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { MeetingStatusBadge } from './meeting-status-badge'
import type { OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export function PersonMeetingsPanel({ personId, meetings }: { personId: string; meetings: OneOnOneRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href={`/one-on-ones/new?personId=${personId}`}>
            <Plus />
            Programar One2One
          </Link>
        </Button>
      </div>

      {meetings.length === 0 ? (
        <EmptyState title="Aún no hay One2One con esta persona" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {meetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/one-on-ones/${meeting.id}`}
              className="flex items-center justify-between py-2.5 text-sm hover:bg-secondary/40"
            >
              <span className="tabular-nums">
                {new Date(meeting.scheduled_at).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <MeetingStatusBadge status={meeting.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
