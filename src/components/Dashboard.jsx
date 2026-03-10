import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from './Header'

const FREE_LIMIT = 5

export default function Dashboard() {
  const navigate = useNavigate()
  const userRaw = localStorage.getItem('autogen_user')
  const user = userRaw ? JSON.parse(userRaw) : null
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const isPremium = user?.plan === 'premium'
  const generationsUsed = user?.generationsUsed || 0

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const h = JSON.parse(localStorage.getItem(`autogen_history_${user.email}`) || '[]')
    setHistory(h)
  }, [])

  function handleDelete(id) {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem(`autogen_history_${user.email}`, JSON.stringify(updated))
    if (selected?.id === id) setSelected(null)
  }

  function handleClearAll() {
    if (!confirm('Delete all history? This cannot be undone.')) return
    setHistory([])
    setSelected(null)
    localStorage.removeItem(`autogen_history_${user.email}`)
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleExport(item) {
    const blob = new Blob([item.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `autogen-${item.type.toLowerCase().replace(/ /g, '-')}-${item.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredHistory = history.filter(h =>
    h.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.output.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) return null

  const stats = [
    { label: 'Total Generated', value: history.length, icon: '⚡' },
    { label: 'This Month (Free)', value: isPremium ? '∞' : `${generationsUsed}/${FREE_LIMIT}`, icon: '📊' },
    { label: 'Plan', value: isPremium ? 'Premium' : 'Free', icon: isPremium ? '⭐' : '🆓' },
    { label: 'Member Since', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { month: 'short', year: 'numeric' }) : 'Today', icon: '📅' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Header />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="font-display" style={{ fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Welcome back, <strong>{user.name || user.email.split('@')[0]}</strong>
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{s.icon}</div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <div style={{
            background: 'linear-gradient(135deg, var(--ink) 0%, #1a1a3e 100%)',
            borderRadius: 14,
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 28,
          }}>
            <div>
              <p className="font-display" style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem', marginBottom: 4 }}>
                ⭐ Unlock unlimited generations
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>
                Upgrade to Premium for just $9/month
              </p>
            </div>
            <Link to="/pricing" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Upgrade Now →
            </Link>
          </div>
        )}

        {/* History section */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Generation History
            </h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                className="input"
                type="text"
                placeholder="Search history…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: 200, padding: '8px 14px', fontSize: '0.88rem' }}
              />
              {history.length > 0 && (
                <button onClick={handleClearAll} className="btn-ghost" style={{ fontSize: '0.82rem', color: '#cf1322' }}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📭</div>
              <p className="font-display" style={{ fontWeight: 700, marginBottom: 8 }}>
                {history.length === 0 ? 'No generations yet' : 'No results found'}
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: 24 }}>
                {history.length === 0 ? 'Start generating to see your history here.' : 'Try a different search term.'}
              </p>
              {history.length === 0 && (
                <Link to="/app" className="btn-primary" style={{ fontSize: '0.9rem', padding: '12px 24px' }}>
                  Start Generating →
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selected ? '300px 1fr' : '1fr', minHeight: 400 }}>
              {/* List */}
              <div style={{ borderRight: selected ? '1px solid var(--border)' : 'none', overflowY: 'auto', maxHeight: 600 }}>
                {filteredHistory.map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSelected(item)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: selected?.id === item.id ? 'var(--accent-soft)' : 'white',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                          <span className="font-display" style={{ fontWeight: 700, fontSize: '0.85rem', color: selected?.id === item.id ? 'var(--accent)' : 'var(--text)' }}>
                            {item.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.output.slice(0, 80)}…
                        </p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                          {new Date(item.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(item.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: '2px', flexShrink: 0 }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail view */}
              {selected && (
                <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1.3rem' }}>{selected.icon}</span>
                      <span className="font-display" style={{ fontWeight: 700 }}>{selected.type}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(selected.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isPremium && (
                        <button onClick={() => handleExport(selected)} className="btn-ghost" style={{ fontSize: '0.82rem' }}>
                          ↓ Export
                        </button>
                      )}
                      <button onClick={() => handleCopy(selected.output)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                        {copied ? '✓ Copied' : '📋 Copy'}
                      </button>
                      <button onClick={() => setSelected(null)} className="btn-ghost" style={{ fontSize: '0.9rem' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                  <div
                    className="output-content"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '20px',
                    }}
                  >
                    {selected.output}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
