import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getProduct } from '../api/products'
import { priceLabel } from '../lib/format'
import type { CatalogProduct } from '../api/types'

export default function Payment() {
  const { slug } = useParams()
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    getProduct(slug)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setError('Product not found.'))
  }, [slug])

  const back = product?.type === 'desktop' ? `/software/${product.slug}` : `/tools/${product?.slug || ''}`

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md bg-tile-orange px-6 py-8">
          <h1 className="font-display text-2xl font-semibold text-ink">Payment</h1>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {product && (
            <>
              <p className="mt-4 font-display text-lg font-semibold text-ink">{product.name}</p>
              <p className="mt-1 text-sm text-teal">{priceLabel(product)}</p>
              <p className="mt-6 text-sm leading-relaxed text-ink/70">
                This is the payment page. Card, UPI, and net banking will be added here later. Downloads stay locked until this step is finished.
              </p>
              <button
                type="button"
                disabled
                className="mt-6 cursor-not-allowed bg-blue px-4 py-3 text-sm font-medium text-paper opacity-50"
              >
                Complete payment
              </button>
              <p className="mt-6 text-sm">
                <Link to={back} className="font-medium text-teal hover:underline">Back to product</Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
