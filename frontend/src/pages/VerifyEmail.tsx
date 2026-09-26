import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { verifyEmailRequest } from '../api/auth'

export default function VerifyEmail() {
  const { token } = useParams()
  const [message, setMessage] = useState('Verifying your email…')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage('This verification link is invalid.')
      return
    }
    verifyEmailRequest(token)
      .then(() => {
        setOk(true)
        setMessage('Email verified. You can log in now.')
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || 'This verification link is invalid.')
      })
  }, [token])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Email verification</h1>
          <p className={`mt-4 text-sm ${ok ? 'text-teal' : 'text-ink/70'}`}>{message}</p>
          {ok && (
            <Link to="/login" className="mt-6 inline-block text-sm font-medium text-teal hover:underline">
              Log in
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
