import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          ResourceBridge
        </Link>

        <nav className="topnav">
          <Link to="/how-it-works">How it works</Link>
          <ThemeToggle />
          <Link to="/role-selection" className="nav-cta">
            Sign in / Join <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} />
              THE SHARED RESOURCE NETWORK
            </div>

            <h1>
              Great resources
              <br />
              <span>shouldn't sit idle.</span>
            </h1>

            <p className="hero-description">
              Discover equipment, workspaces, and technical facilities
              when you need them. Or share your unused resources with
              people and organisations you choose.
            </p>

            <div className="hero-actions">
              <Link to="/role-selection" className="btn btn-primary">
                Get started <ArrowRight size={17} />
              </Link>

              <Link to="/how-it-works" className="btn btn-quiet">
                How it works
              </Link>
            </div>

            <div className="trust-line">
              <ShieldCheck size={17} />
              Owner-controlled access
              <span />
              <CheckCircle2 size={17} />
              Transparent bookings
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="visual-center">
              <span className="visual-symbol">↗</span>
              <strong>Shared potential</strong>
              <small>Resources meet opportunity</small>
            </div>

            <div className="floating-card card-top">
              <span className="mini-icon cyan">⌘</span>
              <div>
                <strong>Creative workspace</strong>
                <small>Owner-managed availability</small>
              </div>
              <span className="status-dot" />
            </div>

            <div className="floating-card card-bottom">
              <span className="mini-icon violet">⚙</span>
              <div>
                <strong>Technical equipment</strong>
                <small>Approval-based access</small>
              </div>
              <ShieldCheck size={17} className="muted-icon" />
            </div>
          </div>
        </section>

        <section className="value-grid">
          <article className="value-card">
            <span className="value-icon">
              <Clock3 size={21} />
            </span>
            <h3>Make idle resources useful</h3>
            <p>
              Help equipment and spaces serve a purpose instead of
              remaining unused.
            </p>
          </article>

          <article className="value-card">
            <span className="value-icon">
              <ShieldCheck size={21} />
            </span>
            <h3>Share on your terms</h3>
            <p>
              Providers control eligibility, availability, pricing,
              and booking approval.
            </p>
          </article>

          <article className="value-card">
            <span className="value-icon">
              <CheckCircle2 size={21} />
            </span>
            <h3>Build trust</h3>
            <p>
              Keep booking decisions, check-ins, condition reports,
              and incidents accountable.
            </p>
          </article>
        </section>

        <section className="bottom-cta">
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h2>What brings you to ResourceBridge?</h2>
            <p>
              Share resources you control or find something you need.
            </p>
          </div>

          <Link to="/role-selection" className="btn btn-primary">
            Choose your role <ArrowRight size={17} />
          </Link>
        </section>
      </main>

      <footer className="footer">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          ResourceBridge
        </Link>
        <span>Make idle resources useful.</span>
      </footer>
    </div>
  )
}