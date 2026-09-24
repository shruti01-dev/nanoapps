import { type ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

type LegalLayoutProps = {
  title: string
  lastUpdated: string
  children: ReactNode
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-ink/50">Last updated: {lastUpdated}</p>
          <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-ink/80">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}