import * as React from 'react'

import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-6.5 w-6.5 text-xs',
  lg: 'h-11 w-11 text-sm',
} as const

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  size?: keyof typeof sizeClasses
}

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

function Avatar({ name, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-accent-foreground',
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
