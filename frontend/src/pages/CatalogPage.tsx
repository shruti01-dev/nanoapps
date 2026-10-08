import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api/products'
import type { CatalogProduct } from '../api/types'

type CatalogPageProps = {
  type: 'web' | 'desktop'
  title: string
  intro: string
}

export default function CatalogPage({ type, title, intro }: CatalogPageProps) {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError('')
    getProducts({ type })
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [type])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-line px-6 py-16">
          <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-6xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
              {type === 'desktop' ? 'Desktop software' : 'Browser tools'}
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60">{intro}</p>
          </div>
        </section>
        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            {loading && <p className="text-sm text-ink/60">Loading…</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!loading && !error && products.length === 0 && (
              <div className="bracket-card bg-paper p-8">
                <p className="text-sm text-ink/60">Nothing is listed here yet.</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
