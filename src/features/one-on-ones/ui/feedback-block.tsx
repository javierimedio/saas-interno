'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BlockShell } from './block-shell'
import { updateFeedbackAction } from '../application/update-feedback.action'
import { SPECIAL_BLOCKS } from '../domain/one-on-one-templates'
import type { BlockData } from '../domain/one-on-one.schema'

export function FeedbackBlock({
  meetingId,
  managerComments,
  employeeComments,
  readOnly = false,
}: {
  meetingId: string
  managerComments: string | null
  employeeComments: string | null
  readOnly?: boolean
}) {
  const router = useRouter()
  const [manager, setManager] = React.useState(managerComments ?? '')
  const [employee, setEmployee] = React.useState(employeeComments ?? '')
  const [isSaving, setIsSaving] = React.useState(false)

  const hasContent = manager.trim().length > 0 || employee.trim().length > 0
  const status: BlockData['status'] = hasContent ? 'in_progress' : 'pending'

  async function handleSave() {
    setIsSaving(true)
    const result = await updateFeedbackAction({ id: meetingId, managerComments: manager, employeeComments: employee })
    setIsSaving(false)

    if (!result.ok) {
      toast.error(result.error)
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
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando…' : 'Guardar'}
          </Button>
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
