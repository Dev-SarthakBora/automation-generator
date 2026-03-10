import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isSignup = searchParams.get('signup') === 'true'

  const [mode, setMode] = useState(isSignup ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('autogen_user')
    if (user) navigate('/app')
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)

    setTimeout(() => {
      if (mode === 'signup') {
        // Check if user already exists
        const existing = localStorage.getItem(`autogen_user_${email}`)
        if (existing) { setError('Account already exists. Please log in.'); setLoading(false); return }

        const newUser = {
          email,
          name: name || email.split('@')[0],
          plan: 'free',
          generationsUsed: 0,
          generationsReset: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
        localStorage.setItem(`autogen_user_${email}`, JSON.stringify({ ...newUser, password }))
        localStorage.setItem('autogen_user', JSON.stringify(newUser))
        navigate('/app')
      } else {
        const stored = localStorage.getItem(`autogen_user_${email}`)
        if (!stored) { setError('No account found. Please sign up.'); setLoading(false); return }
        const userData = JSON.parse(stored)
        if (userData.password !== password) { setError('Incorrect password.'); setLoading(false); return }

        const { password: _, ...safeUser } = userData
        localStorage.setItem('autogen_user', JSON.stringify(safeUser))
        navigate('/app')
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, textDecoration: 'none', justifyContent: 'center' }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'var(--accent)',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text)' }}>
            Auto<span style={{ color: 'var(--accent)' }}>Gen</span>
          </span>
        </Link>

        <div className="card" style={{ padding: '36px' }}>
          {/* Tab toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-2)',
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
          }}>
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--text-muted)',
                  boxShadow: mode === m ? 'var(--shadow)' : 'none',
                }}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mode === 'signup' && (
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: '#fff1f0',
                border: '1px solid #ffccc7',
                borderRadius: 8,
                color: '#cf1322',
                fontSize: '0.88rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 4 }}
            >
              {loading ? (
                <><div className="loading-spinner" /> Processing…</>
              ) : mode === 'login' ? 'Log in →' : 'Create free account →'}
            </button>
          </form>

          {mode === 'signup' && (
            <p style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
              By signing up, you agree to our Terms of Service.
              <br />Start with <strong>5 free generations</strong> per month.
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {mode === 'login'
            ? <>Don't have an account? <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Sign up free</button></>
            : <>Already have an account? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Log in</button></>
          }
        </p>
      </div>
    </div>
  )
}
