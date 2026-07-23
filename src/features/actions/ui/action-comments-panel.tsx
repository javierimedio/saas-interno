'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/empty-state'
import { addActionCommentAction } from '../application/add-action-comment.action'
import type { ActionCommentRow } from '../infrastructure/actions.repository'

export function ActionCommentsPanel({ actionId, comments }: { actionId: string; comments: ActionCommentRow[] }) {
  const router = useRouter()
  const [comment, setComment] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (comment.trim().length === 0) return
    setIsSubmitting(true)
    const result = await addActionCommentAction({ actionId, comment })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setComment('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.length === 0 ? (
        <EmptyState title="Sin comentarios todavía" />
      ) : (
        <div className="flex flex-col gap-2">
          {comments.map((c) => (
            <div key={c.id} className="rounded-md border border-border px-3 py-2 text-sm">
              <p>{c.comment}</p>
              <p className="mt-1 text-xs text-text-faint">{new Date(c.created_at).toLocaleString('es-ES')}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Añadir comentario…" />
        <Button onClick={handleSubmit} disabled={isSubmitting || comment.trim().length === 0}>
          Enviar
        </Button>
      </div>
    </div>
  )
}
