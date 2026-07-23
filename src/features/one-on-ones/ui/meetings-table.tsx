import Link from 'next/link'

import { Avatar } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/empty-state'
import { MeetingStatusBadge } from './meeting-status-badge'
import { MEETING_MODE_LABELS } from '../domain/one-on-one.schema'
import type { OneOnOneRow } from '../infrastructure/one-on-ones.repository'

export function MeetingsTable({
  meetings,
  peopleNamesById,
}: {
  meetings: OneOnOneRow[]
  peopleNamesById: Map<string, string>
}) {
  if (meetings.length === 0) {
    return <EmptyState title="Sin reuniones que coincidan con los filtros" />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Persona</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Modo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Valoración</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meetings.map((meeting) => {
          const name = peopleNamesById.get(meeting.person_id) ?? '—'
          return (
            <TableRow key={meeting.id}>
              <TableCell>
                <Link href={`/one-on-ones/${meeting.id}`} className="flex items-center gap-2.5 font-medium">
                  <Avatar name={name} size="sm" />
                  {name}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {new Date(meeting.scheduled_at).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell className="text-muted-foreground">{MEETING_MODE_LABELS[meeting.mode]}</TableCell>
              <TableCell>
                <MeetingStatusBadge status={meeting.status} />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {meeting.overall_rating ? `${meeting.overall_rating}/5` : '—'}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
