'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/shared/empty-state'
import { addPrivateNoteAction } from '../application/add-private-note.action'
import type { PrivateNoteRow } from '../infrastructure/private-notes.repository'

export function PrivateNotesPanel({ personId, notes }: { personId: string; notes: PrivateNoteRow[] }) {
  const router = useRouter()
  const [note, setNote] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (note.trim().length === 0) return

    setIsSubmitting(true)
    const result = await addPrivateNoteAction({ personId, note, visibility: 'manager_only' })
    setIsSubmitting(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setNote('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3" />
        Solo tú (y un admin) podéis ver estas notas — nunca la propia persona.
      </p>

      <div className="flex flex-col gap-2">
        <Textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Escribe una nota privada…"
          rows={3}
        />
        <Button size="sm" className="self-end" onClick={handleSubmit} disabled={isSubmitting || note.trim().length === 0}>
          {isSubmitting ? 'Guardando…' : 'Guardar nota'}
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState title="Sin notas privadas todavía" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {notes.map((n) => (
            <div key={n.id} className="py-2.5 text-sm">
              <p>{n.note}</p>
              <p className="mt-1 text-xs text-text-faint">{new Date(n.created_at).toLocaleString('es-ES')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
