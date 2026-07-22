import type { Metadata } from 'next'

import { Toaster } from '@/components/ui/sonner'
import './globals.css'

// docs/product-design/05-design-system.md §5.1: stack de fuentes del sistema, sin fuente
// web incrustada — prioriza velocidad de carga sobre personalidad tipográfica.

export const metadata: Metadata = {
  title: 'Nexo',
  description: 'Gestión de personas y One2One',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
