import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getDownloadUrl, getProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { payForProduct } from '../lib/checkout'
import { priceLabel } from '../lib/format'
import type { CatalogProduct } from '../api/types'
import ImageCompressor from '../tools/ImageCompressor'
import DataCleaner from '../tools/DataCleaner'

const tools: Record<string, () => ReactNode> = {
  'image-compressor': () => <ImageCompressor />,
  'data-cleaner': () => <DataCleaner />,
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!slug) return
    let active = true
    setLoading(true)
    getProduct(slug)
      .then(({ data }) => {
        if (!active) return
        setProduct(data.product)
        setHasAccess(data.hasAccess)
        setLicenseKey(data.licenseKey)
        setError('')
      })
      .catch(() => {
        if (active) setError('Product not found.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug, user?.id, revision])

  const buy = async () => {
    if (!product) return
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setError('')
    setNotice('')
    setPaying(true)
    try {
      await payForProduct(product.id)
      setNotice(product.is_free ? 'This tool is ready to use.' : 'Payment received.')
      setRevision((value) => value + 1)
    } catch (err: any) {
      const message = err?.message === 'Payment cancelled'
        ? 'Payment cancelled.'
        : err.response?.data?.message || err.message || 'Payment failed.'
      setError(message)
    } finally {
      setPaying(false)
    }
  }

  const download = async (platform: string) => {
    if (!product) return
    setError('')
    try {
      const { data } = await getDownloadUrl(product.id, platform)
      const link = document.createElement('a')
      link.href = data.downloadUrl
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not start download.')
    }
  }

  const Tool = product ? tools[product.slug] : undefined

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {loading && <p className="text-sm text-ink/60">Loading…</p>}
          {!loading && error && !product && <p className="text-sm text-red-600">{error}</p>}
          {product && (
            <>
              <p className="text-xs font-medium text-teal">{priceLabel(product)}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{product.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">{product.description}</p>

              {licenseKey && (
                <p className="mt-4 text-sm text-ink/80">
                  License key: <span className="font-medium text-ink">{licenseKey}</span>
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {!hasAccess && (
                  <button
                    type="button"
                    onClick={buy}
                    disabled={paying}
                    className="bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
                  >
                    {paying ? 'Opening checkout…' : product.is_free ? 'Use this tool' : 'Buy now'}
                  </button>
                )}
                {hasAccess && product.type === 'desktop' && product.platforms.length === 0 && (
                  <p className="text-sm text-ink/60">No files uploaded yet.</p>
                )}
                {hasAccess && product.type === 'desktop' &&
                  (product.platforms.length > 0 ? product.platforms : product.is_free ? ['windows'] : []).map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => download(platform)}
                      className="border border-ink px-4 py-3 text-sm font-medium text-ink transition hover:border-teal hover:text-teal"
                    >
                      {product.is_free && product.platforms.length === 0
                        ? 'Download'
                        : `Download for ${platform === 'windows' ? 'Windows' : 'Mac'}`}
                    </button>
                  ))}
                {!user && (
                  <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`} className="self-center text-sm text-teal">
                    Log in
                  </Link>
                )}
              </div>

              {notice && <p className="mt-4 text-sm text-teal">{notice}</p>}
              {error && product && <p className="mt-4 text-sm text-red-600">{error}</p>}

              {hasAccess && product.type === 'web' && (
                <div className="mt-10">
                  {Tool ? <Tool /> : <p className="text-sm text-ink/60">This web tool is not available in the app yet.</p>}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
