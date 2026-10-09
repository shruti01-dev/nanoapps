import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { resendFirebaseVerification } from '../lib/firebase'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      setSuccess(true)
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
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Create your account</h1>
          <p className="mt-2 text-sm text-ink/60">
            Register to buy tools, subscribe, and manage downloads.
          </p>

          {success ? (
            <div className="mt-8">
              <p className="text-sm text-teal">
                Check your email for a verification link from Firebase, then log in.
              </p>
              <button
                type="button"
                className="mt-4 block text-sm font-medium text-teal hover:underline"
                onClick={() =>
                  resendFirebaseVerification(email, password)
                    .then(() => setNotice('Verification email sent.'))
                    .catch((err) => setNotice(err.message || 'Could not send the verification email.'))
                }
              >
                Resend verification email
              </button>
              {notice && <p className="mt-3 text-sm text-ink/70">{notice}</p>}
              <p className="mt-6 text-sm text-ink/60">
                <Link to="/login" className="font-medium text-teal hover:underline">Go to login</Link>
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
                    className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
                  />
                </div>
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
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-teal"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 bg-ink px-4 py-3 text-sm font-medium text-paper transition hover:bg-blueprint disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Register'}
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
