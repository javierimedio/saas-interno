'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/shared/empty-state'
import { DOCUMENT_CATEGORY } from '../domain/person.schema'
import { deleteDocumentAction, uploadDocumentAction } from '../application/upload-document.action'
import { getDocumentDownloadUrlAction } from '../application/get-document-download-url.action'
import type { DocumentRow } from '../infrastructure/documents.repository'

const CATEGORY_LABELS: Record<string, string> = {
  contract: 'Contrato',
  id_document: 'Documento identificativo',
  review: 'Revisión',
  certificate: 'Certificado',
  other: 'Otro',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsPanel({ personId, documents }: { personId: string; documents: DocumentRow[] }) {
  const router = useRouter()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [category, setCategory] = React.useState<string>('other')
  const [isUploading, setIsUploading] = React.useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set('file', file)
    formData.set('personId', personId)
    formData.set('category', category)

    setIsUploading(true)
    const result = await uploadDocumentAction(formData)
    setIsUploading(false)
    event.target.value = ''

    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Documento subido')
    router.refresh()
  }

  async function handleDelete(document: DocumentRow) {
    const result = await deleteDocumentAction(document)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Documento eliminado')
    router.refresh()
  }

  async function handleDownload(document: DocumentRow) {
    const result = await getDocumentDownloadUrlAction(document.storage_path)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    window.open(result.data, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_CATEGORY.map((value) => (
              <SelectItem key={value} value={value}>
                {CATEGORY_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
          <Upload />
          {isUploading ? 'Subiendo…' : 'Subir documento'}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      {documents.length === 0 ? (
        <EmptyState title="Sin documentos" description="Contrato, certificados, revisiones firmadas…" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium">{document.file_name}</p>
                <p className="text-text-faint">
                  {CATEGORY_LABELS[document.category]} · {formatSize(document.size_bytes)} ·{' '}
                  {new Date(document.created_at).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Descargar" onClick={() => handleDownload(document)}>
                  <Download className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => handleDelete(document)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
