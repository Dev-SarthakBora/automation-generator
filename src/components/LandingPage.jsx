import { Link } from 'react-router-dom'
import Header from './Header'

const FEATURES = [
  { icon: '🛍️', label: 'Shopify Descriptions', desc: 'Product copy that converts browsers into buyers.' },
  { icon: '📧', label: 'Email Sequences', desc: 'Drip campaigns that nurture leads automatically.' },
  { icon: '📘', label: 'Facebook Ads', desc: 'Scroll-stopping ad copy for every audience.' },
  { icon: '💼', label: 'LinkedIn Posts', desc: 'Thought leadership content that builds authority.' },
  { icon: '🎬', label: 'YouTube Scripts', desc: 'Engaging scripts from intro hook to CTA.' },
  { icon: '📝', label: 'Blog Outlines', desc: 'SEO-ready structures ready to fill in.' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Shopify Store Owner', text: 'I wrote 80 product descriptions in one afternoon. Absolutely game-changing.' },
  { name: 'Marcus T.', role: 'Digital Marketer', text: 'My email open rates went up 34% using AutoGen sequences. Worth every penny.' },
  { name: 'Priya R.', role: 'Content Creator', text: 'The YouTube scripts are incredible. It actually understands my niche.' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Header />

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', maxWidth: 860, margin: '0 auto' }}>
        <div className="animate-fade-up">
          <span className="badge badge-accent" style={{ marginBottom: 20, display: 'inline-flex' }}>
            ⚡ AI-Powered Content Automation
          </span>
        </div>

        <h1 className="animate-fade-up-delay-1 font-display" style={{
          fontSize: 'clamp(2.6rem, 6vw, 4.4rem)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          marginBottom: 24,
        }}>
          Generate content that{' '}
          <span className="gradient-text">actually converts</span>
          <br />in seconds.
        </h1>

        <p className="animate-fade-up-delay-2" style={{
          fontSize: '1.18rem',
          color: 'var(--text-muted)',
          maxWidth: 560,
          margin: '0 auto 40px',
          lineHeight: 1.7,
        }}>
          AutoGen writes your Shopify descriptions, email sequences, Facebook ads, LinkedIn posts, YouTube scripts, and blog outlines — instantly.
        </p>

        <div className="animate-fade-up-delay-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login?signup=true" className="btn-primary" style={{ fontSize: '1rem', padding: '16px 32px' }}>
            Start for Free →
          </Link>
          <Link to="/pricing" className="btn-secondary" style={{ fontSize: '1rem', padding: '15px 32px' }}>
            See Pricing
          </Link>
        </div>

        <p className="animate-fade-up-delay-4" style={{ marginTop: 18, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          5 free generations/month · No credit card required
        </p>
      </section>

      {/* Social proof strip */}
      <div style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
        background: 'white',
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }}>
          Trusted by <strong style={{ color: 'var(--text)' }}>2,400+</strong> marketers, store owners, and creators
          &nbsp;·&nbsp; ⭐⭐⭐⭐⭐ <strong style={{ color: 'var(--text)' }}>4.9/5</strong> average rating
        </p>
      </div>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Everything you need to scale content
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto' }}>
            Six powerful generators, one seamless tool.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card card-hover" style={{ padding: '28px 28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.icon}</div>
              <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{f.label}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--ink)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 52 }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { n: '01', title: 'Pick a type', desc: 'Choose from 6 automation types.' },
              { n: '02', title: 'Add your details', desc: 'Describe your product, audience, or topic.' },
              { n: '03', title: 'Generate instantly', desc: 'AI writes your content in seconds.' },
              { n: '04', title: 'Copy & deploy', desc: 'Paste directly into your platform.' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div className="font-display" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent)', opacity: 0.8, lineHeight: 1, marginBottom: 12 }}>{step.n}</div>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'white', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px' }}>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', textAlign: 'center', marginBottom: 48 }}>
          What people are saying
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card" style={{ padding: '28px' }}>
              <div style={{ color: 'var(--accent)', marginBottom: 14, fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</div>
              <p style={{ color: 'var(--text)', lineHeight: 1.7, marginBottom: 20, fontSize: '0.95rem' }}>"{t.text}"</p>
              <div>
                <p className="font-display" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: '0 24px 80px',
        background: 'linear-gradient(135deg, var(--accent) 0%, #ff8c42 100%)',
        borderRadius: 20,
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: 800,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'white', marginBottom: 14, letterSpacing: '-0.02em' }}>
          Start generating today
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32, fontSize: '1.05rem' }}>
          Free plan forever. Upgrade anytime for unlimited access.
        </p>
        <Link to="/login?signup=true" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'white',
          color: 'var(--accent)',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1rem',
          padding: '16px 32px',
          borderRadius: 100,
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}>
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          © 2025 AutoGen · Built with ❤️ for marketers
          &nbsp;·&nbsp;
          <Link to="/pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Pricing</Link>
        </p>
      </footer>
    </div>
  )
}
