import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import { getDownloadUrl, getMyProducts } from '../api/products'
import { cancelSubscription, getMyOrders } from '../api/orders'
import type { OrderRecord, Purchase } from '../api/types'
import { formatInr } from '../lib/format'

export default function Dashboard() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [error, setError] = useState('')

  const load = () => {
    getMyProducts().then(({ data }) => setPurchases(data)).catch(() => {})
    getMyOrders().then(({ data }) => setOrders(data)).catch(() => {})
  }

  useEffect(() => {
    load()
  }, [])

  const handleDownload = async (productId: number, platform: string) => {
    setError('')
    try {
      const { data } = await getDownloadUrl(productId, platform)
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

  const handleCancel = async (subscriptionId: number) => {
    setError('')
    try {
      await cancelSubscription(subscriptionId)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not cancel that subscription.')
    }
  }

  const firstName = user ? user.name.split(' ')[0] : ''

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-2xl font-semibold text-ink">Welcome back, {firstName}</h1>
            <p className="mt-2 text-sm text-ink/60">Your purchases, downloads, and billing, all in one place.</p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-lg font-semibold text-ink">Your tools</h2>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {purchases.length === 0 && (
              <div className="mt-6 bracket-card bg-paper p-8 text-center">
                <p className="text-sm text-ink/60">
                  You have not bought anything yet. Browse{' '}
                  <Link to="/tools" className="font-medium text-teal hover:underline">tools</Link>{' '}
                  or{' '}
                  <Link to="/software" className="font-medium text-teal hover:underline">software</Link>{' '}
                  to get started.
                </p>
              </div>
            )}
            {purchases.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {purchases.map((purchase) => (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    onDownload={handleDownload}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}

            <h2 className="mt-14 font-display text-lg font-semibold text-ink">Billing</h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-ink/60">No payments yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-ink/60">
                    <tr>
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 text-ink">{order.name}</td>
                        <td className="px-4 py-3 text-ink/70">{formatInr(order.amount)}</td>
                        <td className="px-4 py-3 text-ink/70">{order.status}</td>
                        <td className="px-4 py-3 text-ink/70">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-ink/50">{order.razorpay_payment_id || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function PurchaseCard({
  purchase,
  onDownload,
  onCancel,
}: {
  purchase: Purchase
  onDownload: (productId: number, platform: string) => void
  onCancel: (subscriptionId: number) => void
}) {
  const toolUrl = purchase.type === 'desktop' ? `/software/${purchase.slug}` : `/tools/${purchase.slug}`
  const when = purchase.created_at ? new Date(purchase.created_at).toLocaleDateString() : null
  const canCancel = purchase.subscription_id && !purchase.cancel_at_period_end

  return (
    <div className="bracket-card bg-paper p-6">
      <h3 className="font-display text-base font-semibold text-ink">{purchase.name}</h3>
      {when && <p className="mt-1 text-xs text-ink/50">Purchased {when}</p>}
      {purchase.license_key && (
        <p className="mt-2 text-xs text-ink/70">License {purchase.license_key}</p>
      )}
      {purchase.current_period_end && (
        <p className="mt-2 text-xs text-ink/50">
          {purchase.cancel_at_period_end ? 'Access until' : 'Renews'}{' '}
          {new Date(purchase.current_period_end).toLocaleDateString()}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {purchase.type === 'desktop' ? (
          <DesktopButtons purchase={purchase} onDownload={onDownload} />
        ) : (
          <Link
            to={toolUrl}
            className="border border-ink px-3 py-2 text-xs font-medium text-ink transition hover:border-teal hover:text-teal"
          >
            Launch tool
          </Link>
        )}
        {canCancel && (
          <button
            type="button"
            onClick={() => onCancel(purchase.subscription_id!)}
            className="px-3 py-2 text-xs text-ink/60 hover:text-ink"
          >
            Cancel renewal
          </button>
        )}
      </div>
    </div>
  )
}

function DesktopButtons({
  purchase,
  onDownload,
}: {
  purchase: Purchase
  onDownload: (productId: number, platform: string) => void
}) {
  if (purchase.platforms.length === 0) {
    return <p className="text-xs text-ink/50">No files uploaded yet.</p>
  }

  return (
    <>
      {purchase.platforms.map((platform) => (
        <button
          key={platform}
          type="button"
          onClick={() => onDownload(purchase.id, platform)}
          className="border border-ink px-3 py-2 text-xs font-medium text-ink transition hover:border-teal hover:text-teal"
        >
          Download for {platform === 'windows' ? 'Windows' : 'Mac'}
        </button>
      ))}
    </>
  )
}
