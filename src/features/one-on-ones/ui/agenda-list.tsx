'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { addAgendaItemAction, removeAgendaItemAction, toggleAgendaItemAction } from '../application/agenda-item.actions'
import type { AgendaItemRow } from '../infrastructure/agenda-items.repository'

export function AgendaList({
  oneOnOneId,
  items,
  readOnly = false,
}: {
  oneOnOneId: string
  items: AgendaItemRow[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [topic, setTopic] = React.useState('')
  const [isAdding, setIsAdding] = React.useState(false)

  async function handleAdd() {
    if (topic.trim().length === 0) return
    setIsAdding(true)
    const result = await addAgendaItemAction({ oneOnOneId, topic })
    setIsAdding(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setTopic('')
    router.refresh()
  }

  async function handleToggle(item: AgendaItemRow) {
    const result = await toggleAgendaItemAction({ id: item.id, discussed: !item.discussed }, oneOnOneId)
    if (!result.ok) toast.error(result.error)
    router.refresh()
  }

  async function handleRemove(item: AgendaItemRow) {
    const result = await removeAgendaItemAction({ id: item.id }, oneOnOneId)
    if (!result.ok) toast.error(result.error)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 ? (
        <EmptyState title="Sin puntos de agenda todavía" />
      ) : (
        items.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2">
            <Checkbox
              checked={item.discussed}
              disabled={readOnly}
              onCheckedChange={() => handleToggle(item)}
              aria-label="Tratado"
            />
            <span className={item.discussed ? 'flex-1 text-sm text-muted-foreground line-through' : 'flex-1 text-sm'}>
              {item.topic}
            </span>
            {!readOnly ? (
              <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => handleRemove(item)}>
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        ))
      )}

      {!readOnly ? (
        <div className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Añadir punto de agenda…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <Button variant="outline" onClick={handleAdd} disabled={isAdding || topic.trim().length === 0}>
            Añadir
          </Button>
        </div>
      ) : null}
    </div>
  )
}
