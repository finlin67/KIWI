export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-extrabold uppercase text-[var(--kiwi-text-3)]">KIWI</p>
      <h1 className="text-2xl font-extrabold text-[var(--kiwi-text)]">{title}</h1>
      {subtitle ? <p className="mt-1 max-w-3xl text-sm text-[var(--kiwi-text-2)]">{subtitle}</p> : null}
    </div>
  )
}
