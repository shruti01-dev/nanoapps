import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          nanoapps
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink/80 md:flex">
          <Link to="/tools" className="hover:text-ink">Tools</Link>
          <Link to="/software" className="hover:text-ink">Software</Link>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
          {user && <Link to="/dashboard" className="hover:text-ink">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-ink">Admin</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-ink/70">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:border-teal hover:text-teal"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-ink/80 hover:text-ink">
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-blueprint"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}