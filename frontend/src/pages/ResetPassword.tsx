import { useState, type FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { resetPasswordRequest } from '../api/auth'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPasswordRequest(token as string, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Set a new password</h1>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-teal">Password updated. Redirecting to login…</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink/60">
            <Link to="/login" className="font-medium text-teal hover:underline">Back to login</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}