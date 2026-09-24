import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

const software = [
  { format: 'PDF', name: 'PDF Redactor', description: 'Black out sensitive text and images from PDFs before you share them.', type: 'Desktop app' as const },
  { format: 'ZIP', name: 'Batch Renamer', description: 'Rename hundreds of files at once using simple patterns.', type: 'Desktop app' as const },
]

export default function Software() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl font-semibold text-ink">Desktop software</h1>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              One-time purchase, install once, and get future updates from your dashboard.
            </p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {software.map((product) => (
                <ProductCard key={product.name} {...product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}