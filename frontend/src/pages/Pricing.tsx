import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api/products'
import type { CatalogProduct } from '../api/types'

type PriceFilter = 'all' | 'free' | 'one_time' | 'subscription'

export default function Pricing() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<PriceFilter>('all')

  useEffect(() => {
    getProducts()
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Could not load prices.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = products.filter((product) => {
    if (filter === 'free') return product.is_free
    if (filter === 'one_time') return !product.is_free && product.pricing_model === 'one_time'
    if (filter === 'subscription') return product.pricing_model === 'subscription'
    return true
  })

  const choose = (next: Exclude<PriceFilter, 'all'>) => {
    setFilter((current) => (current === next ? 'all' : next))
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">

        <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-3xl font-semibold text-ink">Pricing</h1>
            <p className="mt-2 max-w-lg text-sm text-ink/60">
              Pay once, or subscribe monthly or yearly. Free tools have no charge.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            <button type="button" aria-pressed={filter === 'free'} onClick={() => choose('free')} className={`bracket-card bg-tile-green p-8 text-left transition hover:-translate-y-0.5 hover:shadow-md ${filter === 'free' ? 'border-teal' : ''}`}>
              <span className="text-xs font-medium text-teal">Free</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">No charge</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">Use the tool or software with no payment.</p>
            </button>
            <button type="button" aria-pressed={filter === 'one_time'} onClick={() => choose('one_time')} className={`bracket-card bg-tile-orange p-8 text-left transition hover:-translate-y-0.5 hover:shadow-md ${filter === 'one_time' ? 'border-teal' : ''}`}>
              <span className="text-xs font-medium text-teal">One-time</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">Pay once</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">Pay once and keep using the tool or software.</p>
            </button>
            <button type="button" aria-pressed={filter === 'subscription'} onClick={() => choose('subscription')} className={`bracket-card bg-tile-blue p-8 text-left text-ink transition hover:-translate-y-0.5 hover:shadow-md ${filter === 'subscription' ? 'border-teal' : ''}`}>
              <span className="text-xs font-medium text-amber">Subscription</span>
              <h2 className="mt-2 font-display text-xl font-semibold">Monthly or yearly</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">A repeating payment. Cancel anytime from your dashboard.</p>
            </button>
          </div>
        </section>

        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-2xl font-semibold text-ink">Product prices</h2>
            {loading && <p className="mt-6 text-sm text-ink/60">Loading…</p>}
            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
            {!loading && !error && visible.length === 0 && (
              <p className="mt-6 text-sm text-ink/60">
                {filter === 'all' ? 'Nothing is listed here yet.' : 'Nothing in this group is listed yet.'}
              </p>
            )}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((product) => (
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
