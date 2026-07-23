'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { renameOrganizationAction } from '../application/rename-organization.action'

export function OrganizationNameForm({ currentName }: { currentName: string }) {
  const router = useRouter()
  const [name, setName] = React.useState(currentName)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit() {
    if (name.trim().length < 2 || name.trim() === currentName) return
    setIsSubmitting(true)
    const result = await renameOrganizationAction({ name })
    setIsSubmitting(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Organización renombrada')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || name.trim().length < 2 || name.trim() === currentName}
      >
        Guardar
      </Button>
    </div>
  )
}
