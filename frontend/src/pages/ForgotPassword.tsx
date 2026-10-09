import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { sendFirebasePasswordReset } from '../lib/firebase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      await sendFirebasePasswordReset(email)
      setMessage('If that email is registered, a reset link has been sent.')
    } catch (err: any) {
      setError(err.message || 'Could not send the reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
          <p className="mt-2 text-sm text-ink/60">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          {message && <p className="mt-6 text-sm text-teal">{message}</p>}
          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

          <p className="mt-6 text-sm text-ink/60">
            Remembered it?{' '}
            <Link to="/login" className="font-medium text-teal hover:underline">Log in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}