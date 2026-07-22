'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'cronologia', label: 'Cronología' },
  { id: 'one-on-one', label: 'One2One' },
  { id: 'compensacion', label: 'Compensación' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'notas', label: 'Notas' },
] as const

/**
 * docs/product-design/03-employee-profile.md §3.2: ancla sticky con scrollspy, no pestañas
 * de ruta — el coste de cambiar de sección es un scroll, no una navegación.
 */
export function PersonSectionNav() {
  const [active, setActive] = React.useState<string>(SECTIONS[0].id)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    SECTIONS.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <nav className="sticky top-0 z-10 -mx-1 flex gap-1 bg-background/95 px-1 py-2 backdrop-blur">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors',
            active === section.id && 'bg-primary text-primary-foreground',
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  )
}
