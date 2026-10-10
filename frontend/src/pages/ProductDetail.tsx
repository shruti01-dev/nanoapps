import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getDownloadUrl, getProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { priceLabel } from '../lib/format'
import type { CatalogProduct } from '../api/types'
import ImageCompressor from '../tools/ImageCompressor'
import DataCleaner from '../tools/DataCleaner'
import { builtinBySlug } from '../tools/builtinTools'

const tools: Record<string, () => ReactNode> = {
  'image-compressor': () => <ImageCompressor />,
  'data-cleaner': () => <DataCleaner />,
  ...Object.fromEntries(Object.entries(builtinBySlug).map(([slug, tool]) => [slug, tool.render])),
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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
        if (!active) return
        if (slug && builtinBySlug[slug]) {
          setProduct(null)
          setError('')
          return
        }
        setError('Product not found.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug, user?.id])

  const buy = () => {
    if (!product) return
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    if (!product.is_free) navigate(`/payment/${product.slug}`)
  }

  const download = async (platform: string) => {
    if (!product || !hasAccess) return
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

  const builtin = slug ? builtinBySlug[slug] : undefined
  const Tool = product ? tools[product.slug] : undefined

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {loading && <p className="text-sm text-ink/60">Loading…</p>}
          {!loading && error && !product && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !product && builtin && (
            <>
              <h1 className="font-display text-3xl font-semibold text-ink">{builtin.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">{builtin.summary}</p>
              <div className="mt-8">{builtin.render()}</div>
            </>
          )}
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
                {!hasAccess && !product.is_free && (
                  <button
                    type="button"
                    onClick={buy}
                    className="bg-blue px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
                  >
                    Pay now
                  </button>
                )}
                {!hasAccess && product.is_free && !builtinBySlug[product.slug] && (
                  <button
                    type="button"
                    onClick={buy}
                    className="bg-blue px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
                  >
                    Use this tool
                  </button>
                )}
                {!product.is_free &&
                  (['windows', 'mac'] as const).map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      disabled={!hasAccess}
                      onClick={() => download(platform)}
                      className={
                        hasAccess
                          ? 'border border-ink px-4 py-3 text-sm font-medium text-ink transition hover:border-teal hover:text-teal'
                          : 'cursor-not-allowed border border-line px-4 py-3 text-sm font-medium text-ink/40'
                      }
                    >
                      Download for {platform === 'windows' ? 'Windows' : 'Mac'}
                    </button>
                  ))}
                {hasAccess && product.is_free && product.type === 'desktop' &&
                  (product.platforms.length > 0 ? product.platforms : ['windows']).map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => download(platform)}
                      className="border border-ink px-4 py-3 text-sm font-medium text-ink transition hover:border-teal hover:text-teal"
                    >
                      {product.platforms.length === 0 ? 'Download' : `Download for ${platform === 'windows' ? 'Windows' : 'Mac'}`}
                    </button>
                  ))}
                {!user && !builtinBySlug[product.slug] && (
                  <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`} className="self-center text-sm text-teal">
                    Log in
                  </Link>
                )}
              </div>
              {!product.is_free && !hasAccess && (
                <p className="mt-3 text-xs text-ink/50">Windows and Mac downloads stay locked until payment is complete.</p>
              )}

              {error && product && <p className="mt-4 text-sm text-red-600">{error}</p>}

              {(hasAccess || Boolean(builtinBySlug[product.slug])) && product.type === 'web' && (
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
