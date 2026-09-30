import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api/products'
import type { CatalogProduct } from '../api/types'

export default function Pricing() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Could not load prices.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl font-semibold text-ink">Pricing</h1>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              Pay once, or subscribe monthly or yearly. Free tools have no charge.
            </p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bracket-card bg-paper p-8">
              <span className="text-xs font-medium text-teal">Free</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">No charge</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">Use the tool or software with no payment.</p>
            </div>
            <div className="bracket-card bg-paper p-8">
              <span className="text-xs font-medium text-teal">One-time</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">Pay once</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">Pay once and keep using the tool or software.</p>
            </div>
            <div className="bracket-card bg-blueprint p-8 text-paper">
              <span className="text-xs font-medium text-amber">Subscription</span>
              <h2 className="mt-2 font-display text-xl font-semibold">Monthly or yearly</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">A repeating payment. Cancel anytime from your dashboard.</p>
            </div>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold text-ink">Product prices</h2>
            {loading && <p className="mt-6 text-sm text-ink/60">Loading…</p>}
            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
            {!loading && !error && products.length === 0 && (
              <p className="mt-6 text-sm text-ink/60">Nothing is listed here yet.</p>
            )}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
