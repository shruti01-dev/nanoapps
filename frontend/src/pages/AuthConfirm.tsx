import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabaseSessionRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function AuthConfirm() {
  const { acceptSession } = useAuth()
  const [link] = useState(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const fromHash = params.get('access_token') || ''
    const accessToken = fromHash || sessionStorage.getItem('nanoapps-confirm-token') || ''
    if (accessToken) sessionStorage.setItem('nanoapps-confirm-token', accessToken)
    return { accessToken, errorText: params.get('error_description') || '' }
  })
  const [message, setMessage] = useState('Verifying your email…')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (link.accessToken || link.errorText) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    if (link.errorText) {
      setMessage(decodeURIComponent(link.errorText.replace(/\+/g, ' ')))
      return
    }
    if (!link.accessToken) {
      setMessage('Open the verification link from your email. If you already opened it, log in.')
      return
    }

    let active = true
    supabaseSessionRequest(link.accessToken)
      .then(({ data }) => {
        if (!active) return
        sessionStorage.removeItem('nanoapps-confirm-token')
        acceptSession(data.token, data.user)
        setOk(true)
        setMessage('Email verified. Your account is ready.')
      })
      .catch((err) => {
        if (!active) return
        setMessage(err.response?.data?.message || 'This verification link is invalid.')
      })
    return () => {
      active = false
    }
  }, [acceptSession, link])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink">Email verification</h1>
          <p className={`mt-4 text-sm ${ok ? 'text-teal' : 'text-ink/70'}`}>{message}</p>
          {ok ? (
            <Link to="/dashboard" className="mt-6 inline-block text-sm font-medium text-teal hover:underline">
              Go to your dashboard
            </Link>
          ) : (
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
