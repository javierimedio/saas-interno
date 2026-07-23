import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-[13px] transition-[border-color] outline-none placeholder:text-muted-foreground',
          'focus-visible:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-destructive',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
