import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'

export default function RoleSelectionPage() {
  return (
    <main className="auth-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          ResourceBridge
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </header>

      <section className="role-section">
        <div className="role-heading">
          <span className="eyebrow">
            <ShieldCheck size={15} />
            YOUR RESOURCE NETWORK STARTS HERE
          </span>

          <h1>
            How will you use
            <br />
            <span>ResourceBridge?</span>
          </h1>

          <p>
            Choose the role that fits your needs. You can always
            participate in resource sharing in different ways later.
          </p>
        </div>

        <div className="role-grid">
          <article className="role-card provider-card">
            <div className="role-card-top">
              <span className="role-icon provider-icon">
                <Building2 size={28} />
              </span>
              <span className="role-label">FOR OWNERS</span>
            </div>

            <h2>I have resources to share</h2>

            <p>
              List equipment, workspaces, machinery, or technical
              facilities. Decide who can access them and approve
              booking requests on your terms.
            </p>

            <ul className="role-benefits">
              <li>
                <CheckCircle2 size={17} />
                Create resource listings
              </li>
              <li>
                <CheckCircle2 size={17} />
                Manage availability and eligibility
              </li>
              <li>
                <CheckCircle2 size={17} />
                Review and approve requests
              </li>
            </ul>

            <div className="role-actions">
              <Link
                to="/register/provider"
                className="btn btn-primary role-button"
              >
                Register as provider
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/login/provider"
                className="role-login"
              >
                Already registered? Sign in
              </Link>
            </div>
          </article>

          <article className="role-card seeker-card">
            <div className="role-card-top">
              <span className="role-icon seeker-icon">
                <Search size={28} />
              </span>
              <span className="role-label">FOR RESOURCE SEEKERS</span>
            </div>

            <h2>I need a resource</h2>

            <p>
              Discover available equipment and spaces, compare
              options, request suitable time slots, and track
              your bookings.
            </p>

            <ul className="role-benefits">
              <li>
                <CheckCircle2 size={17} />
                Discover suitable resources
              </li>
              <li>
                <CheckCircle2 size={17} />
                Request available time slots
              </li>
              <li>
                <CheckCircle2 size={17} />
                Track approvals and bookings
              </li>
            </ul>

            <div className="role-actions">
              <Link
                to="/register/seeker"
                className="btn btn-primary role-button"
              >
                Register as seeker
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/login/seeker"
                className="role-login"
              >
                Already registered? Sign in
              </Link>
            </div>
          </article>
        </div>

        <div className="role-note">
          <ShieldCheck size={18} />
          <p>
            <strong>Your access matters.</strong> Providers control
            their resources, and booking requests are subject to
            eligibility requirements and owner approval.
          </p>
        </div>
      </section>

      <footer className="footer">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          ResourceBridge
        </Link>
        <span>Make idle resources useful.</span>
      </footer>
    </main>
  )
}
