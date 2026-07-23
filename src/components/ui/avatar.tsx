import * as React from 'react'

import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-6 w-6 rounded-md text-[10px]',
  md: 'h-8 w-8 rounded-md text-xs',
  lg: 'h-14 w-14 rounded-lg text-base',
  xl: 'h-24 w-24 rounded-lg text-2xl',
} as const

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: keyof typeof sizeClasses
  src?: string | null
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/** Ficha de identidad estilo GOR FACTORY: esquinas redondeadas (no círculo), foto si existe. */
function Avatar({ name, size = 'md', src, className, ...props }: AvatarProps) {
  if (src) {
    return (
      <div
        role="img"
        aria-label={name}
        className={cn('shrink-0 overflow-hidden bg-muted', sizeClasses[size], className)}
        {...props}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- foto de persona: origen desconocido, next/image exigiría permitir cualquier dominio */}
        <img src={src} alt={name} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'flex shrink-0 items-center justify-center bg-accent font-bold text-accent-foreground',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {initialsFrom(name)}
    </div>
  )
}

export { Avatar }
