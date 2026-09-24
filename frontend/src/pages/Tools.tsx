import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

const tools = [
  { format: 'IMG', name: 'Image Compressor', description: 'Shrink image file sizes in bulk without visible quality loss.', type: 'Web tool' as const },
  { format: 'CSV', name: 'Data Cleaner', description: 'Fix messy spreadsheets — duplicates, blanks, and formatting in one pass.', type: 'Web tool' as const },
]

export default function Tools() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl font-semibold text-ink">Web tools</h1>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              Use these directly from your browser — no download needed. Browsing is free;
              using a tool needs an account.
            </p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((product) => (
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