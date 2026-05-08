import { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--kiwi-radius)] border border-[var(--kiwi-border)] bg-white px-5 py-4 shadow-[var(--kiwi-shadow)] ${className}`}>
      {children}
    </div>
  )
}
