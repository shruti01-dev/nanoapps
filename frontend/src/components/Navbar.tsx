import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/tools', label: 'Tools' },
  { to: '/software', label: 'Software' },
  { to: '/#pricing', label: 'Pricing' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
          nanoapps
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink/80 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          {user && <Link to="/dashboard" className="hover:text-ink">Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-ink">Admin</Link>}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-ink/70 sm:inline">Hi, {user.name.split(' ')[0]}</span>
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
          <button
            type="button"
            className="border border-line px-3 py-2 text-sm text-ink md:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((value) => !value)}
          >
            Menu
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-3 border-t border-line px-6 py-4 text-sm text-ink/80 md:hidden">
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          {user && (
            <Link to="/dashboard" onClick={() => setOpen(false)} className="hover:text-ink">
              Dashboard
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setOpen(false)} className="hover:text-ink">
              Admin
            </Link>
          )}
        </nav>
      )}
    </header>
  )
}
