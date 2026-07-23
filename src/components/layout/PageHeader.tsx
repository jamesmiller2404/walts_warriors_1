import React from 'react'

import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-10 max-w-2xl', className)}>
      <h1 className="text-4xl font-bold tracking-tight text-stone-900">{title}</h1>
      {subtitle ? <p className="mt-3 text-lg text-stone-600">{subtitle}</p> : null}
    </div>
  )
}
