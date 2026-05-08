type BadgeVariant = 'new' | 'processing' | 'exported' | 'failed' | 'review' | 'unassigned'

const styles: Record<BadgeVariant, string> = {
  new: 'bg-[var(--kiwi-green-light)] text-[var(--kiwi-green)]',
  processing: 'bg-[var(--kiwi-blue-light)] text-[var(--kiwi-blue)]',
  exported: 'bg-[#eef0f7] text-[var(--kiwi-text-2)]',
  failed: 'bg-[var(--kiwi-red-light)] text-[var(--kiwi-red)]',
  review: 'bg-[var(--kiwi-amber-light)] text-[var(--kiwi-amber)]',
  unassigned: 'bg-[#eef0f7] text-[var(--kiwi-text-2)]'
}

export function Badge({ variant, children }: { variant: BadgeVariant; children: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-extrabold ${styles[variant]}`}>{children}</span>
  )
}
