'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BlockStatusBadge } from './block-status-badge'
import type { BlockData } from '../domain/one-on-one.schema'

export function BlockShell({
  title,
  description,
  status,
  defaultOpen = false,
  footer,
  children,
}: {
  title: string
  description?: string
  status?: BlockData['status']
  defaultOpen?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold">{title}</span>
              {status ? <BlockStatusBadge status={status} /> : null}
            </div>
            {description ? <p className="mt-1 text-xs text-muted-foreground">{description}</p> : null}
          </div>
          <ChevronDown className={cn('mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t border-border px-5 py-4">{children}</div>
          {footer ? <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">{footer}</div> : null}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
