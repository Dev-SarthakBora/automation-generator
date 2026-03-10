import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from './Header'

const FREE_LIMIT = 5

const GENERATOR_TYPES = [
  {
    id: 'shopify',
    icon: '🛍️',
    label: 'Shopify Description',
    description: 'Convert-optimized product copy',
    fields: [
      { id: 'productName', label: 'Product Name', type: 'text', placeholder: 'e.g. Bamboo Water Bottle 750ml' },
      { id: 'features', label: 'Key Features / Benefits', type: 'textarea', placeholder: 'e.g. BPA-free, keeps drinks cold 24h, leak-proof lid...' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. eco-conscious millennials' },
      { id: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Luxury', 'Playful', 'Bold'] },
    ],
    buildPrompt: (f) => `Write a compelling Shopify product description for: "${f.productName}".
Key features: ${f.features}
Target audience: ${f.audience}
Tone: ${f.tone}
Include: a punchy headline, benefit-focused body copy (3-4 short paragraphs), and a bullet list of features. End with a strong call to action.`,
  },
  {
    id: 'email',
    icon: '📧',
    label: 'Email Sequence',
    description: 'Nurture campaigns that convert',
    fields: [
      { id: 'product', label: 'Product / Service', type: 'text', placeholder: 'e.g. Online fitness coaching' },
      { id: 'goal', label: 'Campaign Goal', type: 'select', options: ['Welcome series', 'Abandoned cart', 'Re-engagement', 'Product launch', 'Upsell'] },
      { id: 'emails', label: 'Number of Emails', type: 'select', options: ['3', '5', '7'] },
      { id: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g. new subscribers interested in weight loss' },
    ],
    buildPrompt: (f) => `Write a ${f.emails}-email ${f.goal} email sequence for: "${f.product}".
Audience: ${f.audience}
For each email include: Subject line, Preview text, Body copy (conversational, ~150-200 words), and CTA.
Number them clearly (Email 1, Email 2, etc.) and space them logically over time.`,
  },
  {
    id: 'facebook',
    icon: '📘',
    label: 'Facebook Ad',
    description: 'Scroll-stopping ad copy',
    fields: [
      { id: 'product', label: 'Product / Offer', type: 'text', placeholder: 'e.g. 30-day meal plan subscription' },
      { id: 'benefit', label: 'Main Benefit / Hook', type: 'text', placeholder: 'e.g. lose 10lbs without giving up carbs' },
      { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. women 30-45, health-conscious' },
      { id: 'format', label: 'Ad Format', type: 'select', options: ['Single image', 'Carousel', 'Video script', 'Story ad'] },
      { id: 'cta', label: 'Call to Action', type: 'select', options: ['Shop Now', 'Learn More', 'Sign Up', 'Get Offer', 'Book Now'] },
    ],
    buildPrompt: (f) => `Write a high-converting Facebook ${f.format} ad for: "${f.product}".
Main hook/benefit: ${f.benefit}
Target audience: ${f.audience}
CTA button: ${f.cta}
Include: Primary text (attention-grabbing opening, social proof, urgency), Headline (under 40 chars), Description (under 30 chars). Write 2 variations.`,
  },
  {
    id: 'linkedin',
    icon: '💼',
    label: 'LinkedIn Post',
    description: 'Authority-building content',
    fields: [
      { id: 'topic', label: 'Topic / Insight', type: 'text', placeholder: 'e.g. Why most startups fail at product-market fit' },
      { id: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g. SaaS, Marketing, Finance' },
      { id: 'style', label: 'Post Style', type: 'select', options: ['Storytelling', 'Listicle', 'Hot take', 'Case study', 'Lessons learned'] },
      { id: 'cta', label: 'Goal', type: 'select', options: ['Drive engagement', 'Generate leads', 'Build brand', 'Promote content'] },
    ],
    buildPrompt: (f) => `Write a viral LinkedIn post about: "${f.topic}".
Industry: ${f.industry}
Style: ${f.style}
Goal: ${f.cta}
Format: Strong hook first line (makes people click "see more"), engaging body with line breaks for readability, personal insight or data point, and a question at the end to drive comments. Target 200-350 words. Add 3-5 relevant hashtags.`,
  },
  {
    id: 'youtube',
    icon: '🎬',
    label: 'YouTube Script',
    description: 'Engaging video scripts',
    fields: [
      { id: 'title', label: 'Video Title / Topic', type: 'text', placeholder: 'e.g. 5 Habits That Changed My Life' },
      { id: 'channel', label: 'Channel Niche', type: 'text', placeholder: 'e.g. personal finance, fitness, tech' },
      { id: 'length', label: 'Target Length', type: 'select', options: ['3-5 min (Short)', '8-12 min (Medium)', '15-20 min (Long)'] },
      { id: 'style', label: 'Style', type: 'select', options: ['Educational', 'Entertaining', 'Motivational', 'Tutorial', 'Review'] },
    ],
    buildPrompt: (f) => `Write a complete YouTube script for: "${f.title}".
Channel niche: ${f.channel}
Target length: ${f.length}
Style: ${f.style}
Include: Hook (first 15 seconds to stop scrolling), Intro (briefly tell them what they'll learn), Main content (3-5 sections with [B-ROLL] and [CUT TO] notes), CTA section (subscribe, like, comment prompt), Outro. Mark timing estimates for each section.`,
  },
  {
    id: 'blog',
    icon: '📝',
    label: 'Blog Outline',
    description: 'SEO-optimized content structure',
    fields: [
      { id: 'topic', label: 'Blog Topic', type: 'text', placeholder: 'e.g. How to Start a Dropshipping Business in 2025' },
      { id: 'keyword', label: 'Target Keyword', type: 'text', placeholder: 'e.g. dropshipping business' },
      { id: 'audience', label: 'Reader Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'] },
      { id: 'length', label: 'Article Length', type: 'select', options: ['800-1200 words', '1500-2000 words', '2500-3500 words'] },
    ],
    buildPrompt: (f) => `Create a detailed SEO blog outline for: "${f.topic}".
Target keyword: "${f.keyword}"
Reader level: ${f.audience}
Target length: ${f.length}
Include: SEO title (under 60 chars), Meta description (under 155 chars), Introduction hook, H2 sections with H3 subsections, key points to cover in each section, Internal linking opportunities, FAQ section (5 questions), Conclusion with CTA. Make it comprehensive and actionable.`,
  },
]

export default function GeneratorApp() {
  const navigate = useNavigate()
  const [userRaw] = useState(() => localStorage.getItem('autogen_user'))
  const [user, setUser] = useState(() => userRaw ? JSON.parse(userRaw) : null)
  const [selectedType, setSelectedType] = useState(GENERATOR_TYPES[0])
  const [fields, setFields] = useState({})
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isPremium = user?.plan === 'premium'
  const generationsUsed = user?.generationsUsed || 0
  const canGenerate = isPremium || generationsUsed < FREE_LIMIT

  // Reset fields when type changes
  useEffect(() => {
    setFields({})
    setOutput('')
    setError('')
  }, [selectedType.id])

  function setField(id, value) {
    setFields(prev => ({ ...prev, [id]: value }))
  }

  function syncUser(updated) {
    setUser(updated)
    localStorage.setItem('autogen_user', JSON.stringify(updated))
    const stored = localStorage.getItem(`autogen_user_${updated.email}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      localStorage.setItem(`autogen_user_${updated.email}`, JSON.stringify({ ...parsed, ...updated }))
    }
  }

  async function handleGenerate() {
    if (!canGenerate) {
      navigate('/pricing')
      return
    }

    const requiredFields = selectedType.fields.filter(f => f.type !== 'select')
    const missing = requiredFields.find(f => !fields[f.id]?.trim())
    if (missing) { setError(`Please fill in: ${missing.label}`); return }

    // Set defaults for select fields
    const filledFields = { ...fields }
    selectedType.fields.forEach(f => {
      if (f.type === 'select' && !filledFields[f.id]) {
        filledFields[f.id] = f.options[0]
      }
    })

    setLoading(true)
    setError('')
    setOutput('')

    try {
      const prompt = selectedType.buildPrompt(filledFields)

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: selectedType.id }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setOutput(data.result)

      // Update usage
      if (!isPremium) {
        const updated = { ...user, generationsUsed: generationsUsed + 1 }
        syncUser(updated)
      }

      // Save to history
      const history = JSON.parse(localStorage.getItem(`autogen_history_${user.email}`) || '[]')
      history.unshift({
        id: Date.now(),
        type: selectedType.label,
        icon: selectedType.icon,
        input: filledFields,
        output: data.result,
        createdAt: new Date().toISOString(),
      })
      localStorage.setItem(`autogen_history_${user.email}`, JSON.stringify(history.slice(0, 50)))

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setFields({})
    setOutput('')
    setError('')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Header />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="font-display" style={{ fontWeight: 800, fontSize: '1.6rem', letterSpacing: '-0.02em' }}>
              Content Generator
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pick a type and generate in seconds.</p>
          </div>

          {/* Usage indicator */}
          {!isPremium && (
            <div className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Free generations
                  </span>
                  <span className="font-display" style={{ fontSize: '0.78rem', fontWeight: 700, color: generationsUsed >= FREE_LIMIT ? 'var(--accent)' : 'var(--text)' }}>
                    {generationsUsed}/{FREE_LIMIT}
                  </span>
                </div>
                <div className="usage-bar" style={{ width: 160 }}>
                  <div className="usage-bar-fill" style={{ width: `${Math.min((generationsUsed / FREE_LIMIT) * 100, 100)}%` }} />
                </div>
              </div>
              <Link to="/pricing" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                ⭐ Upgrade
              </Link>
            </div>
          )}
          {isPremium && (
            <span className="badge badge-yellow">⭐ Premium — Unlimited</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Sidebar: Type selector */}
          <div className="card" style={{ padding: '12px' }}>
            <p className="label" style={{ padding: '8px 12px 12px' }}>Generator Type</p>
            {GENERATOR_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: selectedType.id === type.id ? 'var(--accent-soft)' : 'transparent',
                  color: selectedType.id === type.id ? 'var(--accent)' : 'var(--text)',
                  transition: 'all 0.15s',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{type.icon}</span>
                <div>
                  <div className="font-display" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{type.label}</div>
                  <div style={{ fontSize: '0.72rem', color: selectedType.id === type.id ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 1.3, marginTop: 1 }}>{type.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Main area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Input form */}
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <span style={{ fontSize: '1.5rem' }}>{selectedType.icon}</span>
                <div>
                  <h2 className="font-display" style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedType.label}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedType.description}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                {selectedType.fields.map(field => (
                  <div key={field.id} style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
                    <label className="label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className="input"
                        placeholder={field.placeholder}
                        value={fields[field.id] || ''}
                        onChange={e => setField(field.id, e.target.value)}
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="input"
                        value={fields[field.id] || field.options[0]}
                        onChange={e => setField(field.id, e.target.value)}
                      >
                        {field.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="input"
                        type="text"
                        placeholder={field.placeholder}
                        value={fields[field.id] || ''}
                        onChange={e => setField(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ marginTop: 18, padding: '12px 16px', background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 8, color: '#cf1322', fontSize: '0.88rem' }}>
                  {error}
                </div>
              )}

              {!canGenerate && (
                <div style={{ marginTop: 18, padding: '16px', background: 'var(--accent-soft)', border: '1px solid #ffccc7', borderRadius: 10, textAlign: 'center' }}>
                  <p className="font-display" style={{ fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>You've used all 5 free generations</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 14 }}>Upgrade to Premium for unlimited generations.</p>
                  <Link to="/pricing" className="btn-primary" style={{ fontSize: '0.9rem', padding: '11px 24px' }}>
                    Upgrade to Premium — $9/mo →
                  </Link>
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !canGenerate}
                  className="btn-primary"
                  style={{
                    opacity: !canGenerate ? 0.5 : 1,
                    cursor: !canGenerate ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <><div className="loading-spinner" /> Generating…</>
                  ) : (
                    <>⚡ Generate {selectedType.label}</>
                  )}
                </button>
                {(output || Object.keys(fields).length > 0) && (
                  <button onClick={handleReset} className="btn-ghost">
                    ↺ Reset
                  </button>
                )}
              </div>
            </div>

            {/* Output */}
            {(output || loading) && (
              <div className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    Generated Output
                  </h3>
                  {output && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={handleCopy}
                        className="btn-secondary"
                        style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                      >
                        {copied ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <div className="loading-spinner" style={{ borderTopColor: 'var(--accent)', borderColor: 'var(--border)' }} />
                    <span>AI is writing your content…</span>
                  </div>
                ) : (
                  <div
                    className="output-content"
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 10,
                      padding: '20px',
                      maxHeight: 600,
                      overflowY: 'auto',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {output}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
