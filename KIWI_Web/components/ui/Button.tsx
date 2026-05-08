'use client'

import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary: 'min-h-9 px-4 bg-[var(--kiwi-blue)] text-white hover:bg-[#2f4ac5]',
  secondary:
    'min-h-9 px-[14px] bg-white border border-[var(--kiwi-border)] text-[var(--kiwi-text-2)] hover:border-[var(--kiwi-blue)] hover:bg-[var(--kiwi-blue-pale)] hover:text-[var(--kiwi-blue)]',
  danger:
    'min-h-9 px-4 bg-white border border-[var(--kiwi-red-light)] text-[var(--kiwi-red)] hover:bg-[var(--kiwi-red-light)]',
  ghost: 'min-h-9 px-2 text-[var(--kiwi-text-3)] hover:text-[var(--kiwi-text-2)]'
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-[var(--kiwi-radius-sm)] text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
