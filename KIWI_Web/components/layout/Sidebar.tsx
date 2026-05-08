'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/setup', label: 'Home', icon: 'home' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
  { href: '/triage', label: 'Triage', icon: 'triage' },
  { href: '/inventory', label: 'Inventory', icon: 'inventory' },
  { href: '/batch-prep', label: 'Batch Your Files', icon: 'batch' }
] as const

type NavIconName = (typeof nav)[number]['icon']

function navIsActive(pathname: string | null, href: string) {
  if (href === '/setup') return pathname === '/setup' || pathname === '/'
  return pathname === href
}

export function Sidebar(_props: { expertMode: boolean; onExpertChange: (value: boolean) => void }) {
  const pathname = usePathname()

  return (
    <aside className="border-b border-[var(--kiwi-border)] bg-white px-3 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:pr-2">
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
              className={`group flex items-center gap-2 rounded-[var(--kiwi-radius-sm)] border px-2.5 py-2.5 text-sm font-bold transition-colors ${
                active
                  ? 'border-[var(--kiwi-border-strong)] bg-[var(--kiwi-blue-pale)] text-[var(--kiwi-blue)]'
                  : 'border-transparent text-[var(--kiwi-text-2)] hover:border-[var(--kiwi-border)] hover:bg-[var(--kiwi-blue-pale)] hover:text-[var(--kiwi-blue)]'
              }`}
            >
              <span
                className={`inline-flex h-4 w-4 shrink-0 transition-opacity ${
                  active
                    ? 'items-center justify-center opacity-100 translate-x-[1px]'
                    : 'items-center justify-center opacity-70 group-hover:opacity-95 group-hover:translate-x-[1px]'
                }`}
                aria-hidden="true"
              >
                <NavIcon name={item.icon} />
              </span>
              <span className="leading-none">{item.label}</span>
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

function NavIcon({ name }: { name: NavIconName }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-[15px] w-[15px]'
  }

  if (name === 'home') {
    return (
      <svg {...commonProps}>
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
      </svg>
    )
  }

  if (name === 'settings') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.88 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.03 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.88.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.88V9c0 .69.41 1.32 1.03 1.56.17.07.35.1.53.1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03z" />
      </svg>
    )
  }

  if (name === 'triage') {
    return (
      <svg {...commonProps}>
        <path d="M4 5h16" />
        <path d="M7 12h10" />
        <path d="M10 19h4" />
      </svg>
    )
  }

  if (name === 'inventory') {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}
