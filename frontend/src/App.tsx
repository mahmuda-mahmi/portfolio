import { useEffect, useState, type FormEvent } from 'react';
import { FALLBACK_PORTFOLIO } from './data/fallbackPortfolio';
import type { PortfolioData, ProjectItem } from './types/portfolio';

const TOP_LETTERS = ['M', 'A', 'H', 'M', 'U', 'D', 'A'];
const BOTTOM_LETTERS = ['', 'A', 'K', 'T', 'E', 'R', ''];

const TECH_STACK = [
  'React 19',
  'TypeScript',
  'NestJS 11',
  'Laravel',
  'PHP',
  'Node.js',
  'MySQL',
  'MongoDB',
  'Vite',
  'Git & Vercel',
];

function formatTimecode(seconds: number): string {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

export function App() {
  const [data, setData] = useState<PortfolioData>(FALLBACK_PORTFOLIO);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [elapsed, setElapsed] = useState(3);
  const [showExtendedBio, setShowExtendedBio] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [submitFeedback, setSubmitFeedback] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFromApi() {
      try {
        const [healthRes, portfolioRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/portfolio'),
        ]);
        if (!cancelled && healthRes.ok) {
          setApiStatus('online');
        } else if (!cancelled) {
          setApiStatus('offline');
        }
        if (!cancelled && portfolioRes.ok) {
          const json = (await portfolioRes.json()) as PortfolioData;
          setData(json);
        }
      } catch {
        if (!cancelled) {
          setApiStatus('offline');
        }
      }
    }

    loadFromApi();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCopyEmail() {
    try {
      await navigator.clipboard.writeText(data.profile.email);
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      window.location.href = `mailto:${data.profile.email}`;
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitState('sending');
    setSubmitFeedback('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string | string[] };
      if (!res.ok) {
        const errMsg = Array.isArray(json.message)
          ? json.message.join(', ')
          : json.message ?? 'Could not send message.';
        setSubmitState('error');
        setSubmitFeedback(errMsg);
        return;
      }
      setSubmitState('sent');
      setSubmitFeedback(json.message?.toString() ?? 'Message received!');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setSubmitState('error');
      setSubmitFeedback('Network error reaching the NestJS API.');
    }
  }

  return (
    <>
      <div className="vhs-grain" aria-hidden="true" />

      <header className="topbar">
        <a href="#top" className="topbar__brand">
          <span>{data.profile.name}</span>
          <span aria-hidden="true">▶</span>
        </a>
        <a href="#contact" className="topbar__link">
          <span className="topbar__dot" aria-hidden="true" />
          <span>CONTACT</span>
        </a>
      </header>

      <main id="top" className="container">
        {/* Hero VHS Grid */}
        <section className="hero" aria-label="Introduction">
          <div className="vhs-grid">
            {TOP_LETTERS.map((char, idx) => (
              <div key={`top-${idx}`} className="vhs-tile vhs-tile--letter">
                {idx === 0 && <span className="vhs-osd vhs-osd--tl">PLAY ▶</span>}
                <span>{char}</span>
              </div>
            ))}

            {/* Middle VHS Static Row */}
            {Array.from({ length: 7 }).map((_, idx) => (
              <div
                key={`mid-${idx}`}
                className={`vhs-tile vhs-tile--static ${
                  idx === 3 ? 'vhs-tile--accent' : ''
                } ${idx > 3 ? 'vhs-tile--hide-mobile' : ''}`}
              >
                {idx === 0 && <span className="vhs-osd vhs-osd--bl">SP</span>}
                {idx === 3 && <span className="vhs-osd vhs-osd--center">SWE // DEV</span>}
                {idx === 6 && (
                  <span className="vhs-osd vhs-osd--br">{formatTimecode(elapsed)}</span>
                )}
              </div>
            ))}

            {/* Bottom Row: AKTER */}
            {BOTTOM_LETTERS.map((char, idx) => (
              <div
                key={`bot-${idx}`}
                className={`vhs-tile ${char ? 'vhs-tile--letter' : 'vhs-tile--static vhs-tile--hide-mobile'}`}
              >
                {char}
              </div>
            ))}
          </div>

          <div className="hero__captions">
            <p className="hero__caption">{data.profile.tagline}</p>
            <p className="hero__caption hero__caption--right">{data.profile.subTagline}</p>
          </div>

          <div className="scroll-hint">
            <span>scroll down</span>
            <span className="caret-blink" aria-hidden="true" />
          </div>
        </section>

        {/* Editorial Statement */}
        <section className="editorial" aria-label="Engineering Philosophy">
          <h1 className="editorial__headline">
            {data.editorial.headlinePrefix}{' '}
            <span className="badge-invert">{data.editorial.headlineHighlight}</span>{' '}
            {data.editorial.headlineSuffix}
          </h1>
        </section>

        {/* About */}
        <section id="about" className="about" aria-label="About Mahmuda">
          <div>
            <p className="about__copy">{data.profile.bioShort}</p>
            <p className="about__subcopy">{data.profile.bioExtended}</p>

            <button
              type="button"
              className="wipe-btn"
              onClick={() => setShowExtendedBio((v) => !v)}
            >
              <span>▶ {showExtendedBio ? 'HIDE STACK DETAILS' : "HI, I'M MAHMUDA"}</span>
            </button>

            {showExtendedBio && (
              <div className="stack-pills" aria-label="Core Technologies">
                {TECH_STACK.map((tech) => (
                  <span key={tech} className="stack-pill">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="profile-card">
            <div className="profile-card__screen">
              <div className="profile-card__status">
                <span>● REC // MAHMUDA.SITE</span>
                <span>API: {apiStatus.toUpperCase()}</span>
              </div>
              <div className="profile-card__ascii">
                SOFTWARE
                <br />
                DEVELOPER
              </div>
              <div className="profile-card__meta">
                <span>@{data.profile.handle}</span>
                <span>REACT 19 + NESTJS 11</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Selected Work */}
        <section id="work" className="work" aria-label="Selected Work">
          <h2 className="section-heading">
            <span>SELECTED</span>
            <span className="badge-invert">WORK</span>
          </h2>

          <div className="work-list">
            {data.projects.map((project) => (
              <article
                key={project.id}
                className={`work-card work-card--${project.cardTone}`}
                onClick={() => setSelectedProject(project)}
              >
                <div>
                  <div className="work-card__top">
                    <span>{project.id}</span>
                    <span>/</span>
                    <span>{project.category}</span>
                    <span>/</span>
                    <span>{project.year}</span>
                  </div>
                  <h3 className="work-card__title">{project.title}</h3>
                  <p className="work-card__summary">{project.summary}</p>
                  <div className="work-card__tags">
                    {project.stack.map((item) => (
                      <span key={item} className="work-card__tag">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <span className="work-card__cta">▶ CASE STUDY</span>
              </article>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section id="services" className="capabilities" aria-label="Capabilities">
          <p className="capabilities__intro">
            EVERY PROJECT BRIDGES ARCHITECTURE WITH CRAFT:
          </p>
          <div className="capabilities__list">
            {data.capabilities.map((cap) => (
              <div key={cap.id} className="cap-row">
                <span className="cap-row__label">▶ {cap.label}</span>
                <span className="cap-row__detail">{cap.detail}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contact & Footer */}
        <section id="contact" className="contact" aria-label="Contact">
          <div>
            <h2 className="contact__heading">SAY HI!</h2>
            <button type="button" className="contact__email-btn" onClick={handleCopyEmail}>
              <span>▶</span>
              <span>{copiedEmail ? 'COPIED TO CLIPBOARD!' : data.profile.email.toUpperCase()}</span>
            </button>
            <p className="about__subcopy">
              Available for full-stack software engineering roles, freelance builds, and technical
              collaborations.
            </p>
            <div className="contact__socials">
              <a
                href={data.profile.socials.github}
                target="_blank"
                rel="noreferrer"
                className="wipe-btn"
              >
                ↗ GITHUB
              </a>
              <a
                href={data.profile.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="wipe-btn"
              >
                ↗ LINKEDIN
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={4}
                required
                minLength={5}
                placeholder="Tell me about your project or role..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button type="submit" className="wipe-btn" disabled={submitState === 'sending'}>
              <span>{submitState === 'sending' ? 'SENDING...' : '▶ SEND MESSAGE'}</span>
            </button>
            {submitFeedback && (
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--mono)',
                  fontSize: '0.82rem',
                  color: submitState === 'error' ? '#ff8a8a' : 'var(--accent)',
                }}
              >
                {submitFeedback}
              </p>
            )}
          </form>
        </section>

        <footer className="footer-bar">
          <span>© {new Date().getFullYear()} MAHMUDA AKTER · MAHMUDA.SITE</span>
          <span>BUILT WITH REACT 19 + NESTJS 11</span>
        </footer>
      </main>

      {/* Case Study Modal */}
      {selectedProject && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={selectedProject.title}
          onClick={() => setSelectedProject(null)}
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-panel__close"
              onClick={() => setSelectedProject(null)}
            >
              CLOSE ✕
            </button>
            <p className="about__subcopy" style={{ marginBottom: 8 }}>
              {selectedProject.id} // {selectedProject.category} · {selectedProject.year}
            </p>
            <h2 className="section-heading" style={{ marginBottom: 16 }}>
              {selectedProject.title}
            </h2>
            <p style={{ lineHeight: 1.6, marginBottom: 20 }}>{selectedProject.summary}</p>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', marginBottom: 8 }}>
              ARCHITECTURE
            </h3>
            <p className="about__subcopy">{selectedProject.architecture}</p>
            <h3 style={{ fontFamily: 'var(--display)', fontSize: '0.95rem', marginBottom: 8 }}>
              HIGHLIGHTS
            </h3>
            <ul style={{ lineHeight: 1.7, paddingLeft: 20, marginBottom: 24 }}>
              {selectedProject.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <a
              href={selectedProject.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="wipe-btn"
            >
              ↗ VIEW SOURCE ON GITHUB
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
