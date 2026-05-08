'use client'

import { HelpCircle } from 'lucide-react'

export function HelpIcon({ 
  title,
  className = ''
}: { 
  title: string
  className?: string
}) {
  return (
    <span title={title} aria-label={title} className="inline-flex">
      <HelpCircle
        className={`h-4 w-4 cursor-help text-[var(--kiwi-text-3)] transition-colors hover:text-[var(--kiwi-blue)] ${className}`}
        aria-hidden="true"
      />
    </span>
  )
}
