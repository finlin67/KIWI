'use client'

import './globals.css'
import { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ProjectProvider } from '@/lib/context'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favico.ico" sizes="any" />
      </head>
      <body>
        <ProjectProvider>
          <AppShell>{children}</AppShell>
        </ProjectProvider>
      </body>
    </html>
  )
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-[var(--kiwi-bg)] lg:grid-cols-[280px_1fr]">
      <Sidebar expertMode={false} onExpertChange={() => undefined} />
      <div className="min-w-0">
        <TopBar />
        <main className="min-h-screen bg-[var(--kiwi-bg)] px-3 py-3 text-[var(--kiwi-text-2)] md:px-5 md:py-5">
          {children}
        </main>
      </div>
    </div>
  )
}
