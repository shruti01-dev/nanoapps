import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ToolPegboard from '../components/ToolPegboard'
import ProductCard from '../components/ProductCard'

const products = [
  { format: 'PDF', name: 'PDF Redactor', description: 'Black out sensitive text and images from PDFs before you share them.', type: 'Desktop app' as const },
  { format: 'IMG', name: 'Image Compressor', description: 'Shrink image file sizes in bulk without visible quality loss.', type: 'Web tool' as const },
  { format: 'CSV', name: 'Data Cleaner', description: 'Fix messy spreadsheets — duplicates, blanks, and formatting in one pass.', type: 'Web tool' as const },
  { format: 'ZIP', name: 'Batch Renamer', description: 'Rename hundreds of files at once using simple patterns.', type: 'Desktop app' as const },
]

const steps = [
  { number: '1', title: 'Create your account', description: 'Register with your email and verify it in one click.' },
  { number: '2', title: 'Buy or subscribe', description: 'Pick a one-time purchase or a monthly/yearly plan — pay by UPI, card, or net banking.' },
  { number: '3', title: 'Use it from your dashboard', description: 'Launch web tools instantly, or download desktop software with your license attached.' },
]

export default function Landing() {
  return (
    <div className="bg-paper">
      <Navbar />

      {/* Hero */}
      <section className="grid-dots border-b border-line">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Small tools.
              <br />
              Serious work.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              One dashboard for every tool you buy, subscribe to, or download —
              PDF utilities, image tools, and desktop software, all in one place.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a href="#products" className="bg-ink px-5 py-3 text-sm font-medium text-paper transition hover:bg-blueprint">
                Browse tools
              </a>
              <a href="#pricing" className="border border-ink px-5 py-3 text-sm font-medium text-ink transition hover:border-teal hover:text-teal">
                See pricing
              </a>
            </div>
          </div>
          <ToolPegboard />
        </div>
      </section>

      {/* Featured products */}
      <section id="products" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-ink">Tools people actually use</h2>
        <p className="mt-2 max-w-lg text-sm text-ink/60">
          A growing catalog of focused utilities. No bloated suites — just the tool you need, ready when you need it.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-line bg-ink/2 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-semibold text-ink">How it works</h2>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative pl-12">
                <span className="font-display absolute left-0 top-0 text-3xl font-semibold text-amber">
                  {step.number}
                </span>
                <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-semibold text-ink">Pay the way that fits the tool</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="bracket-card bg-paper p-8">
            <span className="text-xs font-medium text-teal">Subscription</span>
            <h3 className="mt-2 font-display text-xl font-semibold text-ink">Monthly or yearly</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              For web tools you use regularly. Cancel anytime — access ends at the end of your billing period.
            </p>
          </div>
          <div className="bracket-card bg-blueprint p-8 text-paper">
            <span className="text-xs font-medium text-amber">One-time purchase</span>
            <h3 className="mt-2 font-display text-xl font-semibold">Desktop software</h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/70">
              Pay once, own the license, and download future updates from your dashboard.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
