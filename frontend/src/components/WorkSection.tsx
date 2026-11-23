import { GlitchWord } from './GlitchWord';
import { AtomShatterTile } from './AtomShatterTile';
import type { ProjectItem } from '../types/portfolio';

interface WorkSectionProps {
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
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
                <AtomShatterTile variant={0} />
              </div>,
              cardNode('wg-card--span4'),
              <div key="a1" className="wg-art">
                <AtomShatterTile variant={4} />
              </div>,
            ];
          } else if (idx % 4 === 1) {
            cells = [
              <div key="a0" className="wg-art">
                <AtomShatterTile variant={1} />
              </div>,
              <div key="a1" className="wg-art">
                <AtomShatterTile variant={2} />
              </div>,
              <div key="a2" className="wg-art">
                <AtomShatterTile variant={3} />
              </div>,
              cardNode('wg-card--span3'),
            ];
          } else if (idx % 4 === 2) {
            cells = [
              cardNode('wg-card--span3'),
              <div key="a0" className="wg-art">
                <AtomShatterTile variant={0} />
              </div>,
              <div key="a1" className="wg-art">
                <AtomShatterTile variant={1} />
              </div>,
              <div key="a2" className="wg-art">
                <AtomShatterTile variant={5} />
              </div>,
            ];
          } else {
            cells = [
              <div key="a0" className="wg-art">
                <AtomShatterTile variant={2} />
              </div>,
              cardNode('wg-card--span3'),
              <div key="a1" className="wg-art">
                <AtomShatterTile variant={3} />
              </div>,
              <div key="a2" className="wg-art">
                <AtomShatterTile variant={4} />
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
