import React from 'react'

import { cn } from '@/lib/utils'

const sizes = {
  default: 'max-w-6xl',
  narrow: 'max-w-3xl',
  wide: 'max-w-4xl',
  full: 'max-w-none',
} as const

type ContainerProps = {
  children: React.ReactNode
  size?: keyof typeof sizes
  className?: string
  as?: React.ElementType
}

export function Container({
  children,
  size = 'default',
  className,
  as: Comp = 'div',
}: ContainerProps) {
  return (
    <Comp className={cn('mx-auto px-4 sm:px-6', sizes[size], className)}>
      {children}
    </Comp>
  )
}
