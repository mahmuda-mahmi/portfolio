import { GlitchWord } from './GlitchWord';
import type { ProjectItem } from '../types/portfolio';

interface WorkSectionProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
}

function PixelEmblem({ variant }: { variant: number }) {
  // Monochrome halftone/pixel SVG marks echoing louisejongen.com's square artefact tiles
  const marks = [
    <svg key="0" viewBox="0 0 80 80" width="64" height="64" fill="none">
      <circle cx="40" cy="40" r="24" stroke="#212121" strokeWidth="3" strokeDasharray="4 4" />
      <circle cx="40" cy="40" r="10" fill="#212121" />
    </svg>,
    <svg key="1" viewBox="0 0 80 80" width="64" height="64" fill="none">
      <polygon points="40,12 68,64 12,64" stroke="#212121" strokeWidth="3" strokeDasharray="3 3" />
      <rect x="34" y="38" width="12" height="12" fill="#212121" />
    </svg>,
    <svg key="2" viewBox="0 0 80 80" width="64" height="64" fill="none">
      <rect x="16" y="16" width="48" height="48" rx="8" stroke="#212121" strokeWidth="3" />
      <path d="M26 40H54M40 26V54" stroke="#212121" strokeWidth="3" strokeDasharray="4 3" />
    </svg>,
    <svg key="3" viewBox="0 0 80 80" width="64" height="64" fill="none">
      <path
        d="M22 58L40 20L58 58H22Z"
        fill="#212121"
        fillOpacity="0.16"
        stroke="#212121"
        strokeWidth="3"
      />
      <circle cx="40" cy="44" r="5" fill="#212121" />
    </svg>,
    <svg key="4" viewBox="0 0 80 80" width="64" height="64" fill="none">
      <ellipse cx="40" cy="40" rx="16" ry="28" stroke="#212121" strokeWidth="3" />
      <path d="M40 20V60M28 40H52" stroke="#212121" strokeWidth="2.5" />
    </svg>,
    <svg key="5" viewBox="0 0 80 80" width="64" height="64" fill="none">
      <polygon points="24,18 62,18 54,62 16,62" fill="#212121" fillOpacity="0.18" stroke="#212121" strokeWidth="3" />
    </svg>,
  ];
  return marks[variant % marks.length];
}

export function WorkSection({ projects, onSelectProject }: WorkSectionProps) {
  return (
    <section id="work" className="work-section" aria-label="Selected Work">
      <h2 className="work-heading">
        <span>SELECTED</span>
        <GlitchWord text="WORK" />
      </h2>

      <div className="work-grid">
        {projects.map((project, idx) => {
          // Alternate row composition exactly like louisejongen.com:
          // Row 0: [art] [card span 4] [art]
          // Row 1: [art] [art] [art] [card span 3]
          // Row 2: [card span 3] [art] [art] [art]
          // Row 3: [art] [card span 3] [art] [art]
          const cardNode = (spanClass: string) => (
            <div key="card" className={`wg-card ${spanClass}`}>
              <div>
                <h3 className="wg-card__title">{project.title}</h3>
                <p className="wg-card__cat">{project.category}</p>
              </div>
              <div className="wg-card__meta">
                <span>{project.stack.join(' · ')}</span>
                <span>▶ CASE STUDY</span>
              </div>
            </div>
          );

          let cells: React.ReactNode[];
          if (idx % 4 === 0) {
            cells = [
              <div key="a0" className="wg-art">
                <PixelEmblem variant={0} />
              </div>,
              cardNode('wg-card--span4'),
              <div key="a1" className="wg-art">
                <PixelEmblem variant={4} />
              </div>,
            ];
          } else if (idx % 4 === 1) {
            cells = [
              <div key="a0" className="wg-art">
                <PixelEmblem variant={1} />
              </div>,
              <div key="a1" className="wg-art">
                <PixelEmblem variant={2} />
              </div>,
              <div key="a2" className="wg-art">
                <PixelEmblem variant={3} />
              </div>,
              cardNode('wg-card--span3'),
            ];
          } else if (idx % 4 === 2) {
            cells = [
              cardNode('wg-card--span3'),
              <div key="a0" className="wg-art">
                <PixelEmblem variant={0} />
              </div>,
              <div key="a1" className="wg-art">
                <PixelEmblem variant={1} />
              </div>,
              <div key="a2" className="wg-art">
                <PixelEmblem variant={5} />
              </div>,
            ];
          } else {
            cells = [
              <div key="a0" className="wg-art">
                <PixelEmblem variant={2} />
              </div>,
              cardNode('wg-card--span3'),
              <div key="a1" className="wg-art">
                <PixelEmblem variant={3} />
              </div>,
              <div key="a2" className="wg-art">
                <PixelEmblem variant={4} />
              </div>,
            ];
          }

          return (
            <article
              key={project.id}
              className="wg-row"
              onClick={() => onSelectProject(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProject(project);
                }
              }}
            >
              {cells}
            </article>
          );
        })}
      </div>
    </section>
  );
}
