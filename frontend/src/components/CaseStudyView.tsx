import type { ProjectItem } from '../types/portfolio';

interface CaseStudyViewProps {
  project: ProjectItem;
  onBack: () => void;
}

export function CaseStudyView({ project, onBack }: CaseStudyViewProps) {
  return (
    <div className="case-shell">
      {/* Left column: 4 equal-height mini bordered boxes */}
      <aside className="case-sidebar">
        <div className="case-meta-card">
          <span className="case-meta-tag">PROJECT</span>
          <p className="mono-copy" style={{ margin: 0 }}>
            {project.category}
          </p>
        </div>

        <div className="case-meta-card">
          <span className="case-meta-tag">STACK</span>
          <div className="mono-copy" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {project.stack.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </div>

        <div className="case-meta-card">
          <span className="case-meta-tag">YEAR</span>
          <p className="mono-copy" style={{ margin: 0 }}>
            {project.year}
          </p>
        </div>

        <a
          href={project.liveUrl ?? project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="case-meta-card case-meta-card--link button-wipe"
        >
          <span className="label">
            ▶ {project.liveUrl ? 'LIVE WEBSITE' : 'GITHUB REPOSITORY'}
          </span>
        </a>
      </aside>

      {/* Right column: Large top-right project media + bottom title & mini detail boxes */}
      <main className="case-main">
        <div className="case-media-stage">
          <button
            type="button"
            className="case-back-btn button-wipe label"
            onClick={onBack}
          >
            <span>◀◀ BACK</span>
          </button>

          {project.previewVideo ? (
            <video
              className="case-media-asset"
              src={project.previewVideo}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : project.previewImage ? (
            <img
              className="case-media-asset"
              src={project.previewImage}
              alt={`${project.title} preview`}
            />
          ) : (
            <div className="case-media-fallback">
              <span className="display" style={{ fontSize: 'var(--display-2)' }}>
                {project.title}
              </span>
            </div>
          )}
        </div>

        <div className="case-title-panel">
          <h1 className="display case-title-text">{project.title}</h1>
        </div>

        <div className="case-mini-grid">
          <div className="case-mini-box">
            <span className="case-meta-tag">OVERVIEW</span>
            <p className="case-mini-body">{project.summary}</p>
          </div>

          <div className="case-mini-box">
            <span className="case-meta-tag">ARCHITECTURE</span>
            <p className="case-mini-body">{project.architecture}</p>
          </div>

          <div className="case-mini-box">
            <span className="case-meta-tag">HIGHLIGHTS</span>
            <ul className="case-mini-list">
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
