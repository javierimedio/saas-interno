'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Checkbox } from '@/components/ui/checkbox'
import { BlockShell } from './block-shell'
import { MeetingActionsPanel } from './meeting-actions-panel'
import { updateMeetingDataAction } from '../application/update-meeting-data.action'
import { SPECIAL_BLOCKS } from '../domain/one-on-one-templates'
import type { BlockData, MeetingData } from '../domain/one-on-one.schema'
import type { ActionRow } from '@/features/actions/infrastructure/actions.repository'

const EMPTY_BLOCK: BlockData = { status: 'pending', fields: {} }

export function ActionPlanBlock({
  meetingId,
  meetingData,
  actions,
  personId,
  managerId,
  personName,
  managerName,
  readOnly = false,
}: {
  meetingId: string
  meetingData: MeetingData
  actions: ActionRow[]
  personId: string
  managerId: string
  personName: string
  managerName: string
  readOnly?: boolean
}) {
  const router = useRouter()
  const initialBlock = meetingData.blocks.action_plan ?? EMPTY_BLOCK
  const [completed, setCompleted] = React.useState(initialBlock.status === 'completed')
  const [isSaving, setIsSaving] = React.useState(false)

  const status: BlockData['status'] = completed ? 'completed' : actions.length > 0 ? 'in_progress' : 'pending'

  async function toggleCompleted(checked: boolean) {
    setCompleted(checked)
    setIsSaving(true)
    const nextStatus: BlockData['status'] = checked ? 'completed' : actions.length > 0 ? 'in_progress' : 'pending'
    const result = await updateMeetingDataAction({
      id: meetingId,
      meetingData: { version: 1, blocks: { ...meetingData.blocks, action_plan: { ...initialBlock, status: nextStatus } } },
    })
    setIsSaving(false)

    if (!result.ok) {
      toast.error(result.error)
      setCompleted(!checked)
      return
    }

    router.refresh()
  }

  return (
    <BlockShell
      title={SPECIAL_BLOCKS.action_plan.title}
      description={SPECIAL_BLOCKS.action_plan.description}
      status={status}
      defaultOpen
      footer={
        !readOnly ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox checked={completed} disabled={isSaving} onCheckedChange={(checked) => toggleCompleted(checked === true)} />
            Marcar como tratado
          </label>
        ) : undefined
      }
    >
      <MeetingActionsPanel
        oneOnOneId={meetingId}
        personId={personId}
        managerId={managerId}
        personName={personName}
        managerName={managerName}
        actions={actions}
        readOnly={readOnly}
      />
    </BlockShell>
  )
}
