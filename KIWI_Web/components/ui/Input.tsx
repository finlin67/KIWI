import { forwardRef, InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={`h-10 w-full rounded-[var(--kiwi-radius-sm)] border border-[var(--kiwi-border-strong)] bg-white px-3 text-[var(--kiwi-text)] outline-none placeholder:text-[var(--kiwi-text-3)] focus:border-[var(--kiwi-blue)] focus:ring-1 focus:ring-[var(--kiwi-blue)] ${className}`}
      {...props}
    />
  )
})
