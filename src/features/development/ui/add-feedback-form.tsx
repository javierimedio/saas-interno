'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addFeedbackAction } from '../application/add-feedback.action'

export function AddFeedbackForm({ personId }: { personId: string }) {
  const router = useRouter()
  const [text, setText] = React.useState('')
  const [visibility, setVisibility] = React.useState<'manager_only' | 'shared_with_employee'>('manager_only')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (text.trim().length === 0) return
    setIsSubmitting(true)
    const result = await addFeedbackAction({ personId, text, visibility })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    setText('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Añadir feedback…" />
      <div className="flex items-center justify-between gap-2">
        <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manager_only">Solo visible para admin</SelectItem>
            <SelectItem value="shared_with_employee">Compartido con la persona</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSubmit} disabled={isSubmitting || text.trim().length === 0}>
          Guardar
        </Button>
      </div>
    </div>
  )
}
