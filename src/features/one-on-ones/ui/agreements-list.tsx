'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/empty-state'
import { addAgreementAction } from '../application/add-agreement.action'
import type { AgreementRow } from '../infrastructure/agreements.repository'

export function AgreementsList({
  oneOnOneId,
  agreements,
  readOnly = false,
}: {
  oneOnOneId: string
  agreements: AgreementRow[]
  readOnly?: boolean
}) {
  const router = useRouter()
  const [description, setDescription] = React.useState('')
  const [isAdding, setIsAdding] = React.useState(false)

  async function handleAdd() {
    if (description.trim().length === 0) return
    setIsAdding(true)
    const result = await addAgreementAction({ oneOnOneId, description })
    setIsAdding(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setDescription('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {agreements.length === 0 ? (
        <EmptyState title="Sin acuerdos todavía" />
      ) : (
        <ul className="flex flex-col gap-1.5">
          {agreements.map((agreement) => (
            <li key={agreement.id} className="rounded-md border border-border px-3 py-2 text-sm">
              {agreement.description}
            </li>
          ))}
        </ul>
      )}

      {!readOnly ? (
        <div className="flex gap-2">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Añadir acuerdo…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdd()
              }
            }}
          />
          <Button variant="outline" onClick={handleAdd} disabled={isAdding || description.trim().length === 0}>
            Añadir
          </Button>
        </div>
      ) : null}
    </div>
  )
}
