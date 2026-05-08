'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TopBar() {
  const pathname = usePathname()
  const legacyQueueBanner = pathname === '/queue' || pathname === '/monitor'

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--kiwi-border)] bg-[var(--kiwi-bg)] px-3 py-3 backdrop-blur md:px-5">
        <div className="flex min-h-[70px] w-full items-center justify-between gap-4 rounded-[var(--kiwi-radius)] border border-[var(--kiwi-border)] bg-white px-4 py-3 shadow-[var(--kiwi-shadow)]">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase text-[var(--kiwi-text-3)]">Production Workspace</p>
            <h1 className="truncate text-xl font-extrabold text-[var(--kiwi-text)] md:text-2xl">
              Knowledge Intake Workbench Intelligence - KIWI
            </h1>
          </div>
          <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 md:flex">
            <span className="inline-flex rounded-full bg-[var(--kiwi-green-light)] px-3 py-1 text-xs font-extrabold text-[var(--kiwi-green)]">
              Backend: Live Local Service
            </span>
            <span className="inline-flex rounded-full bg-[var(--kiwi-blue-light)] px-3 py-1 text-xs font-extrabold text-[var(--kiwi-blue)]">
              Profile: Configurable
            </span>
            <Link
              href="/help"
              className="inline-flex rounded-full bg-[#eef0f7] px-3 py-1 text-xs font-extrabold text-[var(--kiwi-text-2)] hover:bg-[var(--kiwi-blue-pale)] hover:text-[var(--kiwi-blue)]"
            >
              Help
            </Link>
          </div>
        </div>
      </header>

      {legacyQueueBanner ? (
        <div className="border-b border-[var(--kiwi-border)] bg-[var(--kiwi-blue-pale)] px-6 py-2.5 text-center text-sm text-[var(--kiwi-text-2)]">
          <Link href="/setup" className="font-medium text-[var(--kiwi-blue)] underline decoration-[var(--kiwi-blue)] underline-offset-2">
            Queue and Run Monitor are now on the Home screen. Click here to go to Home →
          </Link>
        </div>
      ) : null}
    </>
  )
}
