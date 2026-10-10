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
  const downloadPlatforms = !product
    ? []
    : product.type === 'desktop'
      ? (product.platforms.length > 0 ? product.platforms : ['windows', 'mac'])
      : !product.is_free
        ? ['windows', 'mac']
        : []

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

              <div className="mt-6 flex flex-wrap items-center gap-3">
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
                {!user && !builtinBySlug[product.slug] && (
                  <Link to={`/login?next=${encodeURIComponent(window.location.pathname)}`} className="text-sm font-medium text-teal">
                    Log in
                  </Link>
                )}
              </div>

              {downloadPlatforms.length > 0 && (
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {downloadPlatforms.map((platform) => (
                    <DownloadCard
                      key={platform}
                      platform={platform}
                      enabled={hasAccess}
                      lockedNote={product.is_free ? 'Log in to download this installer.' : 'This download unlocks after payment.'}
                      onDownload={() => download(platform)}
                    />
                  ))}
                </div>
              )}
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

const downloadStyles: Record<string, { name: string; fill: string; note: string }> = {
  windows: { name: 'Windows', fill: 'bg-tile-blue', note: 'Installer for Windows computers.' },
  mac: { name: 'Mac', fill: 'bg-tile-orange', note: 'Installer for Mac computers.' },
}

function DownloadCard({
  platform,
  enabled,
  lockedNote,
  onDownload,
}: {
  platform: string
  enabled: boolean
  lockedNote: string
  onDownload: () => void
}) {
  const style = downloadStyles[platform] || downloadStyles.windows

  return (
    <div className={`bracket-card flex flex-col p-6 ${style.fill}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{style.name}</p>
      <h2 className="mt-2 font-display text-xl font-semibold text-ink">Download for {style.name}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">
        {enabled ? style.note : lockedNote}
      </p>
      <button
        type="button"
        disabled={!enabled}
        onClick={onDownload}
        className={
          enabled
            ? 'mt-6 bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint'
            : 'mt-6 cursor-not-allowed bg-paper/80 px-4 py-3 text-sm font-medium text-ink/40'
        }
      >
        Download for {style.name}
      </button>
    </div>
  )
}
