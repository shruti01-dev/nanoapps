import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { getDownloadUrl, getProduct } from '../api/products'
import { useAuth } from '../context/AuthContext'
import { priceLabel } from '../lib/format'
import type { CatalogProduct } from '../api/types'
export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [product, setProduct] = useState<CatalogProduct | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'mac'>('windows')

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
        const available = (['windows', 'mac'] as const).filter((platform) =>
          data.product.platforms.includes(platform)
        )
        setSelectedPlatform(available[0] || 'windows')
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
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not start download.')
    }
  }

  const desktopPlatforms = product
    ? (['windows', 'mac'] as const).filter((platform) => product.platforms.includes(platform))
    : []
  const downloadPlatforms = desktopPlatforms.length > 0 ? desktopPlatforms : (['windows', 'mac'] as const)
  const features = product?.features?.length
    ? product.features
    : product?.description
      ? [product.description]
      : []

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          {loading && <p className="text-sm text-ink/60">Loading…</p>}
          {!loading && error && !product && <p className="text-sm text-red-600">{error}</p>}
          {product && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-teal">
                  {product.type === 'desktop' ? 'Desktop software' : 'Web tool'} · {priceLabel(product)}
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
                  {product.name}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
                  {product.tagline || product.description}
                </p>
                {product.tagline && product.description && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/60">{product.description}</p>
                )}

                {features.length > 0 && (
                  <ol className="mt-10 flex flex-col gap-4">
                    {features.map((feature, index) => (
                      <li key={`${feature}-${index}`} className="flex gap-4 border-b border-line pb-4 last:border-0">
                        <span className="font-display text-sm font-semibold text-teal">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm leading-relaxed text-ink/80">{feature}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {licenseKey && (
                  <p className="mt-8 text-sm text-ink/80">
                    License key: <span className="font-medium text-ink">{licenseKey}</span>
                  </p>
                )}
              </div>

              <aside className="bracket-card overflow-hidden bg-paper">
                {product.type === 'desktop' ? (
                  <>
                    <div className="border-b border-line bg-blueprint px-6 py-5 text-paper">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber">Installer</p>
                      <h2 className="mt-2 font-display text-2xl font-semibold">Choose your system</h2>
                      <p className="mt-2 text-sm text-paper/70">
                        Official release · Windows and Mac use separate download links.
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 p-6">
                      <div className="grid grid-cols-2 gap-3">
                        {downloadPlatforms.map((platform) => {
                          const ready = product.platforms.includes(platform)
                          const selected = selectedPlatform === platform
                          return (
                            <button
                              key={platform}
                              type="button"
                              disabled={!ready && hasAccess}
                              onClick={() => setSelectedPlatform(platform)}
                              className={
                                selected
                                  ? 'border border-teal bg-teal/10 px-4 py-4 text-left'
                                  : 'border border-line px-4 py-4 text-left transition hover:border-teal/50'
                              }
                            >
                              <p className="text-sm font-medium text-ink">
                                {platform === 'windows' ? 'Windows' : 'Mac'}
                              </p>
                              <p className="mt-1 text-xs text-ink/50">
                                {platform === 'windows' ? '.exe setup' : '.dmg install'}
                                {!ready ? ' · coming soon' : ''}
                              </p>
                            </button>
                          )
                        })}
                      </div>

                      {!hasAccess && !product.is_free && (
                        <button
                          type="button"
                          onClick={buy}
                          className="bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
                        >
                          Pay now
                        </button>
                      )}

                      {!hasAccess && product.is_free && !user && (
                        <button
                          type="button"
                          onClick={buy}
                          className="bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
                        >
                          Log in for free download
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={!hasAccess || !product.platforms.includes(selectedPlatform)}
                        onClick={() => download(selectedPlatform)}
                        className={
                          hasAccess && product.platforms.includes(selectedPlatform)
                            ? 'bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint'
                            : 'cursor-not-allowed bg-ink/20 px-4 py-3 text-sm font-medium text-ink/40'
                        }
                      >
                        Download for {selectedPlatform === 'windows' ? 'Windows' : 'Mac'}
                      </button>

                      {!hasAccess && (
                        <p className="text-xs text-ink/50">
                          {product.is_free
                            ? 'Log in to unlock the installer for your system.'
                            : 'Downloads stay locked until payment is complete.'}
                        </p>
                      )}

                      {!user && (
                        <Link
                          to={`/login?next=${encodeURIComponent(window.location.pathname)}`}
                          className="text-sm text-teal hover:underline"
                        >
                          Log in
                        </Link>
                      )}

                      {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4 p-6">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal">Web tool</p>
                    <h2 className="font-display text-2xl font-semibold text-ink">Use in the browser</h2>
                    <p className="text-sm text-ink/60">
                      {product.is_free
                        ? 'Log in once, then open the tool here.'
                        : 'Pay once, then open the tool here.'}
                    </p>

                    {!hasAccess && (
                      <button
                        type="button"
                        onClick={buy}
                        className="bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
                      >
                        {product.is_free ? 'Use this tool' : 'Pay now'}
                      </button>
                    )}

                    {hasAccess && (
                      <p className="text-sm text-teal">Access unlocked. The tool is ready below.</p>
                    )}

                    {!user && (
                      <Link
                        to={`/login?next=${encodeURIComponent(window.location.pathname)}`}
                        className="text-sm text-teal hover:underline"
                      >
                        Log in
                      </Link>
                    )}

                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>
                )}
              </aside>

              {hasAccess && product.type === 'web' && (
                <div className="lg:col-span-2">
                  <p className="text-sm text-ink/60">This web tool is not available in the app yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
