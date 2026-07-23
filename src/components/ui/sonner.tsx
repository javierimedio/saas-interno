'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

/** Alertas estilo GOR FACTORY: fondo tintado + borde izquierdo de color, no burbujas de color sólido. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-md group-[.toaster]:border-l-4 group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-nexo group-[.toaster]:text-[13px]',
          title: 'group-[.toast]:font-semibold',
          description: 'group-[.toast]:text-muted-foreground',
          success: 'group-[.toast]:!border-l-success group-[.toast]:!bg-success-soft',
          error: 'group-[.toast]:!border-l-destructive group-[.toast]:!bg-danger-soft',
          warning: 'group-[.toast]:!border-l-warning group-[.toast]:!bg-warning-soft',
          info: 'group-[.toast]:!border-l-info group-[.toast]:!bg-info-soft',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
