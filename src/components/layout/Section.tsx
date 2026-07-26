import React from 'react'

import { cn } from '@/lib/utils'

type SectionProps = {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Section({ children, className, as: Comp = 'section' }: SectionProps) {
  return <Comp className={cn('py-6 sm:py-8 lg:py-12', className)}>{children}</Comp>
}
