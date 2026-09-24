import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

const purchases = [
  { format: 'PDF', name: 'PDF Redactor', type: 'Desktop app', date: 'Not purchased yet' },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-2xl font-semibold text-ink">
              Welcome back, {user?.name.split(' ')[0]}
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              Your purchases, downloads, and billing — all in one place.
            </p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-lg font-semibold text-ink">Your tools</h2>

            <div className="mt-6 bracket-card bg-paper p-8 text-center">
              <p className="text-sm text-ink/60">
                You haven't bought anything yet. Browse{' '}
                <a href="/tools" className="font-medium text-teal hover:underline">tools</a>{' '}
                or{' '}
                <a href="/software" className="font-medium text-teal hover:underline">software</a>{' '}
                to get started.
              </p>
            </div>

            <h2 className="mt-12 font-display text-lg font-semibold text-ink">Billing history</h2>
            <div className="mt-6 overflow-hidden border border-line">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-ink/2 text-ink/60">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((item) => (
                    <tr key={item.name} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">{item.name}</td>
                      <td className="px-4 py-3 text-ink/70">{item.type}</td>
                      <td className="px-4 py-3 text-ink/50">{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}