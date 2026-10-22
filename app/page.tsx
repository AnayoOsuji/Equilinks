import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Equilinks home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>equi<span className="brand-light">links</span></span>
        </Link>

        <nav className="login-nav" aria-label="Account access">
          <a className="login-link parent-link" href="/login?role=parent">Parent login</a>
          <a className="login-link admin-link" href="/login?role=admin">Admin login</a>
        </nav>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A place to learn, your way</p>
          <h1 id="hero-title">Different ways<br />to <span>shine.</span></h1>
          <p className="hero-description">
            A more connected school day for autistic and neurodivergent students.
            Built around their strengths, their pace, and the people who care for them.
          </p>
          <a className="primary-link" href="/login?role=parent">
            <span>Find your way in</span>
            <span className="link-arrow" aria-hidden="true">↗</span>
          </a>
          <div className="hero-note">
            <span className="note-icon" aria-hidden="true">✳</span>
            <span>Every mind belongs here.</span>
          </div>
        </div>

        <div className="hero-visual" role="img" aria-label="Students learning together in a bright classroom">
          <div className="visual-caption">
            <span className="caption-mark" aria-hidden="true">✳</span>
            <span>Room to grow.<br /><strong>Space to be you.</strong></span>
          </div>
          <span className="visual-sun" aria-hidden="true" />
          <span className="visual-label">LEARNING, SIDE BY SIDE</span>
        </div>
      </section>

      <footer className="site-footer">
        <p>Small steps. Big possibilities.</p>
        <div className="footer-right">
          <span className="footer-dot" />
          <span>Made for every kind of learner</span>
        </div>
      </footer>
    </main>
  );
}
