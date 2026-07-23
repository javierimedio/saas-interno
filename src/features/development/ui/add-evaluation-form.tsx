'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addEvaluationAction } from '../application/add-evaluation.action'

export function AddEvaluationForm({ personId }: { personId: string }) {
  const router = useRouter()
  const [period, setPeriod] = React.useState('')
  const [result, setResult] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (period.trim().length === 0 || result.trim().length === 0) return
    setIsSubmitting(true)
    const response = await addEvaluationAction({ personId, period, result, notes: notes || undefined })
    setIsSubmitting(false)
    if (!response.ok) {
      toast.error(response.error)
      return
    }
    setPeriod('')
    setResult('')
    setNotes('')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Periodo (ej. 2026-H1)" value={period} onChange={(e) => setPeriod(e.target.value)} />
        <Input placeholder="Resultado" value={result} onChange={(e) => setResult(e.target.value)} />
      </div>
      <Textarea placeholder="Notas (opcional)" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || period.trim().length === 0 || result.trim().length === 0}
        className="self-end"
      >
        Registrar evaluación
      </Button>
    </div>
  )
}
