'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BlockShell } from './block-shell'
import { updateNextMeetingAction } from '../application/update-next-meeting.action'
import { updateMeetingDataAction } from '../application/update-meeting-data.action'
import { SPECIAL_BLOCKS } from '../domain/one-on-one-templates'
import type { BlockData, MeetingData } from '../domain/one-on-one.schema'

const EMPTY_BLOCK: BlockData = { status: 'pending', fields: {} }

function toDatetimeLocal(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ''
}

export function NextMeetingBlock({
  meetingId,
  nextMeetingSuggestedAt,
  meetingData,
  readOnly = false,
}: {
  meetingId: string
  nextMeetingSuggestedAt: string | null
  meetingData: MeetingData
  readOnly?: boolean
}) {
  const router = useRouter()
  const initialBlock = meetingData.blocks.next_meeting ?? EMPTY_BLOCK
  const [date, setDate] = React.useState(toDatetimeLocal(nextMeetingSuggestedAt))
  const [objective, setObjective] = React.useState(initialBlock.fields.main_objective ?? '')
  const [completed, setCompleted] = React.useState(initialBlock.status === 'completed')
  const [isSaving, setIsSaving] = React.useState(false)

  const hasContent = date.trim().length > 0 || objective.trim().length > 0
  const status: BlockData['status'] = completed ? 'completed' : hasContent ? 'in_progress' : 'pending'

  async function handleSave() {
    setIsSaving(true)
    const nextBlock: BlockData = { status, fields: { ...initialBlock.fields, main_objective: objective } }
    const [dateResult, dataResult] = await Promise.all([
      updateNextMeetingAction({ id: meetingId, nextMeetingSuggestedAt: date || undefined }),
      updateMeetingDataAction({
        id: meetingId,
        meetingData: { version: 1, blocks: { ...meetingData.blocks, next_meeting: nextBlock } },
      }),
    ])
    setIsSaving(false)

    if (!dateResult.ok) {
      toast.error(dateResult.error)
      return
    }
    if (!dataResult.ok) {
      toast.error(dataResult.error)
      return
    }

    toast.success('Guardado')
    router.refresh()
  }

  return (
    <BlockShell
      title={SPECIAL_BLOCKS.next_meeting.title}
      description={SPECIAL_BLOCKS.next_meeting.description}
      status={status}
      footer={
        !readOnly ? (
          <div className="flex w-full items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Checkbox checked={completed} onCheckedChange={(checked) => setCompleted(checked === true)} />
              Marcar como tratado
            </label>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-1.5">
        <Label>Fecha aproximada</Label>
        {readOnly ? (
          <p className="text-sm">
            {nextMeetingSuggestedAt
              ? new Date(nextMeetingSuggestedAt).toLocaleString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </p>
        ) : (
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Objetivo principal</Label>
        {readOnly ? (
          <p className="whitespace-pre-wrap text-sm">{objective || '—'}</p>
        ) : (
          <Textarea rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
        )}
      </div>
    </BlockShell>
  )
}
