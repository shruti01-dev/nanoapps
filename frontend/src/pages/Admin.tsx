import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const stats = [
  { label: 'Total users', value: '0' },
  { label: 'Revenue', value: '₹0' },
  { label: 'Orders', value: '0' },
  { label: 'Products', value: '4' },
]

export default function Admin() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-line px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
            <p className="mt-2 text-sm text-ink/60">
              Users, revenue, products, and orders — at a glance.
            </p>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bracket-card bg-paper p-6">
                  <p className="text-sm text-ink/60">{stat.label}</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bracket-card bg-paper p-8 text-center">
              <p className="text-sm text-ink/60">
                User and order management tools will appear here once the backend is connected.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}