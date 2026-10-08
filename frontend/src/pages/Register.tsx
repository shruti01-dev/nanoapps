import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { resendVerificationRequest } from '../api/auth'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verificationLink, setVerificationLink] = useState('')
  const [resendNote, setResendNote] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setVerificationLink('')
    setResendNote('')
    setLoading(true)
    try {
      const data = await register(name, email, password)
      setSuccess(data.message || 'Check your email for a verification link, then log in.')
      if (data.verificationLink) setVerificationLink(data.verificationLink)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
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
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink/60">
            Register to download software, manage licenses, and unlock paid tools.
          </p>

          {success ? (
            <div className="mt-8">
              <p className="text-sm text-teal">{success}</p>
              {verificationLink && (
                <a
                  href={verificationLink}
                  className="mt-4 inline-flex bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint"
                >
                  Open verification link
                </a>
              )}
              <button
                type="button"
                className="mt-4 block text-sm font-medium text-teal hover:underline"
                onClick={handleResend}
              >
                Resend verification email
              </button>
              {resendNote && <p className="mt-2 text-sm text-ink/60">{resendNote}</p>}
              <p className="mt-6 text-sm text-ink/60">
                <Link to="/login" className="font-medium text-teal hover:underline">
                  Go to login
                </Link>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink/80">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                  />
                </div>
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-teal"
                  />
                  <p className="mt-1 text-xs text-ink/45">At least 6 characters.</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-sm text-ink/60">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-teal hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
