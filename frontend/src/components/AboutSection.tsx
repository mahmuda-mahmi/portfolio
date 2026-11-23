import { useState } from 'react';

interface AboutSectionProps {
  handle: string;
  apiStatus: 'checking' | 'online' | 'offline';
}

const STACK = [
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

export function AboutSection({ handle, apiStatus }: AboutSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section id="about" className="about-section" aria-label="About">
      <div className="about-badge-sticky">
        <div className="about-badge-card">
          <div className="about-badge-thumb">
            <span className="mono-copy" style={{ fontSize: '0.72rem', color: '#bfa8f5' }}>
              ● REC // {apiStatus.toUpperCase()}
            </span>
            <span className="display" style={{ fontSize: '1.35rem' }}>
              MAHMUDA
              <br />
              AKTER
            </span>
            <span className="mono-copy" style={{ fontSize: '0.7rem', color: '#8a8a8a' }}>
              @{handle}
            </span>
          </div>

          <button
            type="button"
            className="button-wipe label"
            onClick={() => setOpen((v) => !v)}
          >
            <span>▶ {open ? 'HIDE STACK' : "HI, I'M MAHMUDA"}</span>
          </button>

          {open && (
            <div className="about-drawer">
              {STACK.map((item) => (
                <span key={item} className="about-pill">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="about-lines">
        <p className="about-line">
          WITH A FOUNDATION IN FULL-STACK ENGINEERING AND A DEEP APPRECIATION FOR CRAFT
        </p>
        <p className="about-line about-line--right">
          MAHMUDA BRINGS STRUCTURE TO MODERN SOFTWARE
        </p>
        <p className="about-line">
          INTEGRATING REACT, TYPESCRIPT, NESTJS, AND LARAVEL TO CREATE RESILIENT DIGITAL ECOSYSTEMS
        </p>
      </div>
    </section>
  );
}
