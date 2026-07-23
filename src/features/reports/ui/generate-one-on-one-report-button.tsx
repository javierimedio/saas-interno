'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { generateOneOnOneReportAction } from '../application/generate-one-on-one-report.action'
import { getReportDownloadUrlAction } from '../application/get-report-download-url.action'

export function GenerateOneOnOneReportButton({ oneOnOneId }: { oneOnOneId: string }) {
  const [isGenerating, setIsGenerating] = React.useState(false)

  async function handleClick() {
    setIsGenerating(true)
    const result = await generateOneOnOneReportAction({ oneOnOneId })
    if (!result.ok) {
      setIsGenerating(false)
      toast.error(result.error)
      return
    }
    const urlResult = await getReportDownloadUrlAction(result.data.id)
    setIsGenerating(false)
    if (!urlResult.ok) {
      toast.error(urlResult.error)
      return
    }
    toast.success('Acta generada')
    window.open(urlResult.data, '_blank', 'noopener,noreferrer')
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isGenerating}>
      <FileDown />
      {isGenerating ? 'Generando…' : 'Generar acta PDF'}
    </Button>
  )
}
