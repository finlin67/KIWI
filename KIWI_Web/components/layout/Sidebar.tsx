'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/setup', label: 'Home' },
  { href: '/settings', label: 'Settings' },
  { href: '/triage', label: 'Triage' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/batch-prep', label: 'Batch Your Files' }
] as const

function navIsActive(pathname: string | null, href: string) {
  if (href === '/setup') return pathname === '/setup' || pathname === '/'
  return pathname === href
}

export function Sidebar(_props: { expertMode: boolean; onExpertChange: (value: boolean) => void }) {
  const pathname = usePathname()

  return (
    <aside className="border-b border-[var(--kiwi-border)] bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <Link href="/setup" className="flex items-center gap-3 text-[var(--kiwi-text)] no-underline" aria-label="Go to KIWI home">
        <Image
          src="/kiwi-bird.png"
          alt="KIWI"
          width={52}
          height={52}
          priority
          className="h-[52px] w-[52px] rounded-[var(--kiwi-radius)] border border-[var(--kiwi-border)] object-contain"
        />
        <span className="min-w-0">
          <span className="block text-xl font-extrabold leading-tight">KIWI</span>
          <span className="block max-w-[180px] text-xs font-medium leading-tight text-[var(--kiwi-text-2)]">
            Knowledge Intake Workbench Intelligence
          </span>
        </span>
      </Link>

      <nav className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1" aria-label="Primary navigation">
        {nav.map((item) => {
          const active = navIsActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[var(--kiwi-radius-sm)] border px-3 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? 'border-[var(--kiwi-border-strong)] bg-[var(--kiwi-blue-pale)] text-[var(--kiwi-blue)]'
                  : 'border-transparent text-[var(--kiwi-text-2)] hover:border-[var(--kiwi-border)] hover:bg-[var(--kiwi-blue-pale)] hover:text-[var(--kiwi-blue)]'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-5 rounded-[var(--kiwi-radius)] border border-[var(--kiwi-border)] bg-[var(--kiwi-blue-pale)] p-3 lg:absolute lg:bottom-4 lg:left-4 lg:right-4 lg:mt-0">
        <p className="text-[11px] font-extrabold uppercase text-[var(--kiwi-text-3)]">Production Mode</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--kiwi-text-2)]">
          Real KIWI actions use your local backend, project settings, and batch folders.
        </p>
      </div>
    </aside>
  )
}
