import type { ProjectItem } from '../types/portfolio';

interface CaseStudyViewProps {
  project: ProjectItem;
  onBack: () => void;
}

export function CaseStudyView({ project, onBack }: CaseStudyViewProps) {
  return (
    <div className="case-shell">
      <aside className="case-sidebar">
        <div className="case-meta-card">
          <span className="case-meta-tag">PROJECT</span>
          <p className="mono-copy" style={{ margin: 0 }}>
            {project.category}
          </p>
        </div>

        <div className="case-meta-card">
          <span className="case-meta-tag">STACK</span>
          <p className="mono-copy" style={{ margin: 0 }}>
            {project.stack.join('\n')}
          </p>
        </div>

        <div className="case-meta-card">
          <span className="case-meta-tag">YEAR</span>
          <p className="mono-copy" style={{ margin: 0 }}>
            {project.year}
          </p>
        </div>

        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="case-meta-card case-meta-card--compact button-wipe"
        >
          <span className="label">▶ GITHUB REPOSITORY</span>
        </a>
      </aside>

      <main className="case-main">
        <div className="case-topbar">
          <button type="button" className="button-wipe label" onClick={onBack}>
            <span>◀◀ BACK</span>
          </button>
        </div>

        <div className="case-title-panel">
          <h1 className="display" style={{ fontSize: 'var(--display-1)', margin: 0 }}>
            {project.title}
          </h1>
        </div>

        <div className="case-reel">
          <div className="case-panel">
            <span className="case-meta-tag" style={{ marginBottom: 14 }}>
              OVERVIEW
            </span>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{project.summary}</p>
          </div>

          <div className="case-panel">
            <span className="case-meta-tag" style={{ marginBottom: 14 }}>
              ARCHITECTURE
            </span>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{project.architecture}</p>
          </div>

          <div className="case-panel">
            <span className="case-meta-tag" style={{ marginBottom: 14 }}>
              ENGINEERING HIGHLIGHTS
            </span>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
