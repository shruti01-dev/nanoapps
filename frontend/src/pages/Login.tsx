import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { resendVerificationRequest } from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resendNote, setResendNote] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setNeedsVerify(false)
    setResendNote('')
    setLoading(true)
    try {
      await login(email, password)
      const next = params.get('next')
      navigate(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Something went wrong. Try again.'
      setError(message)
      setNeedsVerify(err.response?.status === 403)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendNote('')
    try {
      const { data } = await resendVerificationRequest(email)
      setResendNote(data.message || 'If that email is unverified, a new link has been sent.')
    } catch (err: any) {
      setResendNote(err.response?.data?.message || 'Could not resend the verification email.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="bracket-card w-full max-w-md bg-paper p-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-teal">Account</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Log in</h1>
          <p className="mt-2 text-sm text-ink/60">
            Access downloads, licenses, and your dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/80">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {needsVerify && (
              <div>
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sm font-medium text-teal hover:underline"
                >
                  Resend verification email
                </button>
                {resendNote && <p className="mt-2 text-sm text-ink/60">{resendNote}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
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
              Create account
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
