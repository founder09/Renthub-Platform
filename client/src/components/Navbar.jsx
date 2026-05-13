import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Sun, Moon, User, LayoutDashboard,
  LogOut, PlusSquare, ChevronDown, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import RentHubLogo from './Logo'
import NotificationBell from './NotificationBell'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setDropOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <nav className="fixed top-0 inset-x-0 z-50 glass border-b" style={{ borderColor: 'var(--border-default)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link to="/" aria-label="RentHub Home">
            <RentHubLogo size={30} />
          </Link>

          {/* ── Desktop Nav ───────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/listings"
              className={`flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 ${isActive('/listings')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : ''
                }`}
              style={{ color: isActive('/listings') ? 'var(--brand-600)' : 'var(--text-muted)' }}>
              <Search size={15} />
              Browse
            </Link>
          </div>

          {/* ── Right Actions ─────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="btn-ghost btn-sm w-9 justify-center"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <>
                {(user.role === 'owner' || user.role === 'admin') && (
                  <Link to="/listings/new" className="btn-primary btn-sm gap-1.5">
                    <PlusSquare size={15} />
                    List Property
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* Avatar dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all duration-150"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                    aria-expanded={dropOpen}
                    aria-haspopup="true">
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--brand-600)' }}>
                      {initials}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate"
                      style={{ color: 'var(--text-primary)' }}>
                      {user.username}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-muted)' }} />
                  </button>

                  {dropOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 surface py-1 fade-in"
                      style={{ zIndex: 100 }}
                      role="menu">
                      {/* User info */}
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Signed in as</p>
                        <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                          {user.username}
                        </p>
                        <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>{user.role}</p>
                      </div>

                      <Link to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        role="menuitem">
                        <span style={{ color: 'var(--text-muted)' }}><LayoutDashboard size={14} /></span>
                        Dashboard
                      </Link>

                      <Link to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        role="menuitem">
                        <span style={{ color: 'var(--text-muted)' }}><User size={14} /></span>
                        My Profile
                      </Link>

                      {(user.role === 'owner' || user.role === 'admin') && (
                        <Link to="/listings/new"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          role="menuitem">
                          <span style={{ color: 'var(--text-muted)' }}><PlusSquare size={14} /></span>
                          Add Listing
                        </Link>
                      )}

                      <div className="border-t mt-1" style={{ borderColor: 'var(--border-default)' }}>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                          style={{ color: 'var(--danger)' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          role="menuitem">
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
                <Link to="/signup" className="btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* ── Mobile toggle ─────────────────────────────── */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggle} className="btn-ghost btn-sm w-9 justify-center" aria-label="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-ghost btn-sm w-9 justify-center"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t fade-in-up"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <div className="px-4 py-4 space-y-1">
            <Link to="/listings"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: 'var(--text-primary)' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              Browse Listings
            </Link>

            {user ? (
              <>
                <Link to="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <LayoutDashboard size={16} style={{ color: 'var(--text-muted)' }} />
                  Dashboard
                </Link>
                <Link to="/profile"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  My Profile — {user.username}
                </Link>
                {(user.role === 'owner' || user.role === 'admin') && (
                  <Link to="/listings/new"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium"
                    style={{ color: 'var(--brand-600)' }}>
                    <PlusSquare size={16} />
                    List a Property
                  </Link>
                )}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium w-full"
                    style={{ color: 'var(--danger)' }}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary btn-sm flex-1 justify-center">Sign In</Link>
                <Link to="/signup" className="btn-primary  btn-sm flex-1 justify-center">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
