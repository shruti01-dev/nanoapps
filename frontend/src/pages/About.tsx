import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="grid-dots border-b border-line px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-3xl font-semibold text-ink">Small tools, built with intent</h1>
            <p className="mt-5 text-base leading-relaxed text-ink/70">nanoapps started from a simple frustration: most software tries to do everything, and ends up doing nothing particularly well. We build the opposite - small, focused tools that solve one problem properly, and get out of your way.</p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-xl font-semibold text-ink">What we believe</h2>
            <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-ink/80">
              <p>A tool should do one job well. We would rather ship a redactor that only redacts, or a renamer that only renames, than bolt ten features onto something that loses focus.</p>
              <p>Software should be affordable to try. That is why most of our web tools are available on a simple monthly or yearly plan, and desktop software is a one-time purchase - no forced bundles, no surprise renewals.</p>
              <p>Everything you buy should live in one place. Your dashboard keeps every purchase, every download, and every invoice together - so you are never digging through old emails to find a license key.</p>
            </div>
          </div>
        </section>

        <section className="border-t border-line px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-xl font-semibold text-ink">Where we are headed</h2>
            <p className="mt-6 text-sm leading-relaxed text-ink/80">nanoapps is early - a small, growing catalog of tools built by people who use them daily. If there is a small, focused tool you wish existed, we would like to hear about it.</p>
            <a href="/contact" className="mt-6 inline-block border border-ink px-5 py-3 text-sm font-medium text-ink transition hover:border-teal hover:text-teal">Get in touch</a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}