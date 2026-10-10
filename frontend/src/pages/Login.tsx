import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { resendFirebaseVerification } from '../lib/firebase'
import PasswordField from '../components/PasswordField'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const next = params.get('next')
      navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm bg-tile-blue px-6 py-8">
          <h1 className="font-display text-2xl font-semibold text-ink">Log in</h1>
          <p className="mt-2 text-sm text-ink/60">
            Access your dashboard, purchases, and downloads.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Password</label>
              <PasswordField required value={password} onChange={setPassword} className="mt-1" />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {error.toLowerCase().includes('verify') && (
              <button
                type="button"
                className="text-sm font-medium text-teal hover:underline"
                onClick={() =>
                  resendFirebaseVerification(email, password)
                    .then(() => setError('Verification email sent. Open it, then log in.'))
                    .catch((err) => setError(err.message || 'Could not send the verification email.'))
                }
              >
                Resend verification email
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-blue px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="mt-4 text-sm">
            <Link to="/forgot-password" className="font-medium text-teal hover:underline">
              Forgot password?
            </Link>
          </p>

          <p className="mt-6 text-sm text-ink/60">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-teal hover:underline">
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}