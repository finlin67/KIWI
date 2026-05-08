import { SelectHTMLAttributes } from 'react'

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-10 w-full rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border-strong)] bg-white px-3 text-sm text-[var(--kiwi-text)] outline-none focus:border-[var(--kiwi-blue)] focus:ring-1 focus:ring-[var(--kiwi-blue)] ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
