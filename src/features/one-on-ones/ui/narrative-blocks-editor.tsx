'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { BlockShell } from './block-shell'
import { updateMeetingDataAction } from '../application/update-meeting-data.action'
import { autoAdvanceBlockStatus } from '../domain/one-on-one.rules'
import { NARRATIVE_BLOCKS, type NarrativeBlockKey } from '../domain/one-on-one-templates'
import type { BlockData, MeetingData } from '../domain/one-on-one.schema'

const EMPTY_BLOCK: BlockData = { status: 'pending', fields: {} }

export function NarrativeBlocksEditor({
  meetingId,
  blockKeys,
  initialMeetingData,
  readOnly = false,
}: {
  meetingId: string
  blockKeys: NarrativeBlockKey[]
  initialMeetingData: MeetingData
  readOnly?: boolean
}) {
  const router = useRouter()
  const [blocks, setBlocks] = React.useState<Record<string, BlockData>>(() =>
    Object.fromEntries(blockKeys.map((key) => [key, initialMeetingData.blocks[key] ?? EMPTY_BLOCK])),
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [dirty, setDirty] = React.useState(false)

  function updateField(blockKey: string, fieldKey: string, value: string) {
    setBlocks((prev) => {
      const current = prev[blockKey] ?? EMPTY_BLOCK
      const next: BlockData = { ...current, fields: { ...current.fields, [fieldKey]: value } }
      return { ...prev, [blockKey]: { ...next, status: autoAdvanceBlockStatus(next) } }
    })
    setDirty(true)
  }

  function markCompleted(blockKey: string, completed: boolean) {
    setBlocks((prev) => {
      const current = prev[blockKey] ?? EMPTY_BLOCK
      const hasContent = Object.values(current.fields).some((value) => value.trim().length > 0)
      const status: BlockData['status'] = completed ? 'completed' : hasContent ? 'in_progress' : 'pending'
      return { ...prev, [blockKey]: { ...current, status } }
    })
    setDirty(true)
  }

  async function handleSave() {
    setIsSaving(true)
    const result = await updateMeetingDataAction({ id: meetingId, blocksPatch: blocks })
    setIsSaving(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setDirty(false)
    toast.success('Borrador guardado')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      {blockKeys.map((key) => {
        const catalog = NARRATIVE_BLOCKS[key]
        const block = blocks[key] ?? EMPTY_BLOCK

        return (
          <BlockShell
            key={key}
            title={catalog.title}
            description={catalog.description}
            status={block.status}
            footer={
              !readOnly ? (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={block.status === 'completed'}
                    onCheckedChange={(checked) => markCompleted(key, checked === true)}
                  />
                  Marcar como tratado
                </label>
              ) : undefined
            }
          >
            {catalog.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label>{field.label}</Label>
                {readOnly ? (
                  <p className="whitespace-pre-wrap text-sm">{block.fields[field.key] || '—'}</p>
                ) : (
                  <Textarea
                    rows={3}
                    value={block.fields[field.key] ?? ''}
                    onChange={(e) => updateField(key, field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </BlockShell>
        )
      })}

      {!readOnly ? (
        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || !dirty}>
            {isSaving ? 'Guardando…' : 'Guardar borrador'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
