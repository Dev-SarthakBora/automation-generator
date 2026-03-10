import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const userRaw = localStorage.getItem('autogen_user')
  const user = userRaw ? JSON.parse(userRaw) : null
  const isPremium = user?.plan === 'premium'

  function handleLogout() {
    localStorage.removeItem('autogen_user')
    navigate('/')
  }

  return (
    <header style={{
      background: 'rgba(248,247,244,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text)' }}>
            Auto<span style={{ color: 'var(--accent)' }}>Gen</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link to="/pricing" className="btn-ghost" style={{ color: location.pathname === '/pricing' ? 'var(--accent)' : undefined }}>
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/app" className="btn-ghost">Generator</Link>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              {isPremium && (
                <span className="badge badge-yellow" style={{ marginRight: 4 }}>⭐ Pro</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {user.email?.split('@')[0]}
                </span>
                <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Log in</Link>
              <Link to="/login?signup=true" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                Start Free →
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
