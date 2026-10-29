
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Package,
  Search,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'

const steps = [
  {
    number: '01',
    icon: UserCheck,
    title: 'Choose your role',
    description:
      'Register as a resource provider or a resource seeker. Your account determines the actions you can take.',
  },
  {
    number: '02',
    icon: Package,
    title: 'List or discover resources',
    description:
      'Providers list equipment and spaces with availability, access requirements, and usage conditions. Seekers explore suitable resources.',
  },
  {
    number: '03',
    icon: CalendarCheck,
    title: 'Request a booking',
    description:
      'Choose an available time slot, explain your intended use, and submit a request for the resource owner to review.',
  },
  {
    number: '04',
    icon: ShieldCheck,
    title: 'Get owner approval',
    description:
      'The provider reviews requests and decides who can use the resource. A request is not a confirmed booking until approved.',
  },
  {
    number: '05',
    icon: ClipboardCheck,
    title: 'Check in, use, and return',
    description:
      'Record check-in and check-out, document the resource condition, and report any issues so the process remains accountable.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark">R</span>
          ResourceBridge
        </Link>

        <nav className="topnav">
          <ThemeToggle />
          <Link to="/role-selection" className="nav-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <main className="how-page">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <section className="how-hero">
          <span className="eyebrow">
            <Search size={15} />
            A SIMPLE, TRUSTED WORKFLOW
          </span>

          <h1>
            From unused
            <br />
            <span>to useful.</span>
          </h1>

          <p>
            ResourceBridge helps people and organisations share
            underused resources while keeping owners in control of
            access, scheduling, and approval.
          </p>
        </section>

        <section className="steps-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE PROCESS</p>
              <h2>Five steps to shared resources</h2>
            </div>

            <span className="step-count">05 STEPS</span>
          </div>

          <div className="steps-list">
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <article className="step-card" key={step.number}>
                  <div className="step-number">{step.number}</div>

                  <div className="step-icon">
                    <Icon size={23} />
                  </div>

                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>

                  <CheckCircle2
                    className="step-check"
                    size={20}
                  />
                </article>
              )
            })}
          </div>
        </section>

        <section className="control-panel">
          <div className="control-icon">
            <ShieldCheck size={28} />
          </div>

          <div>
            <p className="eyebrow">BUILT AROUND TRUST</p>
            <h2>Owners stay in control.</h2>
            <p>
              Providers decide which resources to share, who is
              eligible, which requests to approve, and when resources
              are available. Booking records and condition reports
              support accountability.
            </p>
          </div>
        </section>

        <section className="how-cta">
          <div>
            <p className="eyebrow">YOUR NEXT STEP</p>
            <h2>Ready to participate?</h2>
            <p>
              Share a resource or find the equipment and space you need.
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
