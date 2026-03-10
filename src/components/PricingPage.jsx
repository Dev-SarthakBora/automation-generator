import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from './Header'
import { loadStripe } from '@stripe/stripe-js'

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE')

const FEATURES_FREE = [
  '5 generations per month',
  'All 6 content types',
  'Copy to clipboard',
  'Generation history (limited)',
]

const FEATURES_PRO = [
  'Unlimited generations',
  'All 6 content types',
  'Full generation history',
  'Priority AI speed',
  'Export to text file',
  'Early access to new features',
]

export default function PricingPage() {
  const navigate = useNavigate()
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const userRaw = localStorage.getItem('autogen_user')
  const user = userRaw ? JSON.parse(userRaw) : null
  const isPremium = user?.plan === 'premium'

  async function handleUpgrade() {
    if (!user) {
      navigate('/login?signup=true')
      return
    }

    if (isPremium) return

    setLoadingCheckout(true)

    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-checkout',
          email: user.email,
          successUrl: `${window.location.origin}/app?upgraded=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.sessionId) {
        const stripe = await stripePromise
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else {
        throw new Error(data.error || 'Could not start checkout')
      }
    } catch (err) {
      alert('Error starting checkout: ' + err.message)
    } finally {
      setLoadingCheckout(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Header />

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span className="badge badge-accent" style={{ marginBottom: 20, display: 'inline-flex' }}>
            Simple, transparent pricing
          </span>
          <h1 className="font-display" style={{
            fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>
            Start free. Scale when ready.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.08rem', maxWidth: 460, margin: '0 auto' }}>
            No contracts. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 720, margin: '0 auto' }}>
          {/* Free */}
          <div className="card" style={{ padding: '36px' }}>
            <div style={{ marginBottom: 24 }}>
              <p className="label" style={{ marginBottom: 8 }}>Free</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="font-display" style={{ fontSize: '3rem', fontWeight: 800 }}>$0</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/month</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 6 }}>
                Perfect for getting started
              </p>
            </div>

            <div className="divider" />

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {FEATURES_FREE.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.92rem' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {user ? (
              <Link to="/app" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                {isPremium ? 'Your current plan' : 'Continue with Free'}
              </Link>
            ) : (
              <Link to="/login?signup=true" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                Get Started Free →
              </Link>
            )}
          </div>

          {/* Premium */}
          <div style={{
            background: 'var(--ink)',
            border: '2px solid var(--accent)',
            borderRadius: 'var(--radius)',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Popular badge */}
            <div style={{
              position: 'absolute',
              top: 16,
              right: -28,
              background: 'var(--accent)',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '4px 36px',
              transform: 'rotate(45deg)',
            }}>
              Popular
            </div>

            <div style={{ marginBottom: 24 }}>
              <p className="label" style={{ marginBottom: 8, color: 'rgba(255,255,255,0.5)' }}>Premium</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span className="font-display" style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>$9</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>/month</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', marginTop: 6 }}>
                For serious content creators
              </p>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {FEATURES_PRO.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.92rem', color: 'rgba(255,255,255,0.85)' }}>
                  <span style={{ color: 'var(--accent-2)', fontWeight: 700 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {isPremium ? (
              <div style={{
                textAlign: 'center',
                padding: '14px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 100,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}>
                ⭐ You're on Premium
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loadingCheckout}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '15px' }}
              >
                {loadingCheckout ? (
                  <><div className="loading-spinner" /> Redirecting…</>
                ) : (
                  '⭐ Upgrade to Premium →'
                )}
              </button>
            )}

            <p style={{ textAlign: 'center', marginTop: 14, color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
              Secured by Stripe · Cancel anytime
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 600, margin: '72px auto 0' }}>
          <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: 36, letterSpacing: '-0.02em' }}>
            Frequently asked questions
          </h2>
          {[
            { q: 'What counts as a generation?', a: 'Each time you click "Generate" and receive content, that counts as one generation.' },
            { q: 'Can I cancel anytime?', a: 'Yes, absolutely. Cancel your subscription any time from your dashboard. No questions asked.' },
            { q: 'What AI model powers AutoGen?', a: 'We use Mistral-7B-Instruct via Together AI, optimized for marketing and commercial content.' },
            { q: 'Is my content private?', a: 'Yes. Your generated content is stored locally in your browser and never shared with others.' },
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
              <p className="font-display" style={{ fontWeight: 700, marginBottom: 8 }}>{item.q}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
