import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/layout/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const FAVICON_DATA_URI =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAgACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAQFAwb/xAAjEAACAQMEAwADAAAAAAAAAAABAgMABBESEyExBRRBIlFx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOzopS7u5I5ore2jEk8gLfk2FVRjJJ/pHFJt5W5gmmjurZVEMasSjk7hYkKF4+kY5oK9FTfdvIZI1u7eFBMdEbJIWCvjIDcfcditPF3lxfQmWWBIkyVGH1FiCQT11xQZ+VV45YLmHcWRMqXSPcAU44ZRyRkDrqlbWzkv5byS6eUxyxoivo2zlSTlVPIAJGM9nNXKKCd6F1K8bXV2kmydUYWLSNWMBm55xnoYrbxtpJZWuzJMJcMSGCaezn9n6TTdFB//2Q=='

export const metadata: Metadata = {
  title: 'Nexo | GOR FACTORY',
  description: 'Gestión de personas y One2One — GOR FACTORY',
  icons: {
    icon: FAVICON_DATA_URI,
    shortcut: FAVICON_DATA_URI,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
