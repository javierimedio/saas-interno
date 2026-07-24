'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BlockShell } from './block-shell'
import { updateFeedbackAction } from '../application/update-feedback.action'
import { updateMeetingDataAction } from '../application/update-meeting-data.action'
import { SPECIAL_BLOCKS } from '../domain/one-on-one-templates'
import type { BlockData } from '../domain/one-on-one.schema'

const EMPTY_BLOCK: BlockData = { status: 'pending', fields: {} }

export function FeedbackBlock({
  meetingId,
  managerComments,
  employeeComments,
  initialBlock = EMPTY_BLOCK,
  readOnly = false,
}: {
  meetingId: string
  managerComments: string | null
  employeeComments: string | null
  initialBlock?: BlockData
  readOnly?: boolean
}) {
  const router = useRouter()
  const [manager, setManager] = React.useState(managerComments ?? '')
  const [employee, setEmployee] = React.useState(employeeComments ?? '')
  const [completed, setCompleted] = React.useState(initialBlock.status === 'completed')
  const [isSaving, setIsSaving] = React.useState(false)

  const hasContent = manager.trim().length > 0 || employee.trim().length > 0
  const status: BlockData['status'] = completed ? 'completed' : hasContent ? 'in_progress' : 'pending'

  async function handleSave() {
    setIsSaving(true)
    const [feedbackResult, dataResult] = await Promise.all([
      updateFeedbackAction({ id: meetingId, managerComments: manager, employeeComments: employee }),
      updateMeetingDataAction({ id: meetingId, blocksPatch: { feedback: { ...initialBlock, status } } }),
    ])
    setIsSaving(false)

    if (!feedbackResult.ok) {
      toast.error(feedbackResult.error)
      return
    }
    if (!dataResult.ok) {
      toast.error(dataResult.error)
      return
    }

    toast.success('Feedback guardado')
    router.refresh()
  }

  return (
    <BlockShell
      title={SPECIAL_BLOCKS.feedback.title}
      description={SPECIAL_BLOCKS.feedback.description}
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
        <Label>Feedback del responsable</Label>
        {readOnly ? (
          <p className="whitespace-pre-wrap text-sm">{manager || '—'}</p>
        ) : (
          <Textarea rows={3} value={manager} onChange={(e) => setManager(e.target.value)} />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Feedback de la persona</Label>
        {readOnly ? (
          <p className="whitespace-pre-wrap text-sm">{employee || '—'}</p>
        ) : (
          <Textarea rows={3} value={employee} onChange={(e) => setEmployee(e.target.value)} />
        )}
      </div>
    </BlockShell>
  )
}
