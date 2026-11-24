import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FALLBACK_PORTFOLIO } from './data/fallbackPortfolio';
import type { PortfolioData, ProjectItem } from './types/portfolio';
import { PageGrain } from './components/PageGrain';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { WorkSection } from './components/WorkSection';
import { ArchitectureFlowSection } from './components/ArchitectureFlowSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { CaseStudyView } from './components/CaseStudyView';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [data, setData] = useState<PortfolioData>(FALLBACK_PORTFOLIO);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [healthRes, portfolioRes] = await Promise.all([
          fetch('/api/health'),
          fetch('/api/portfolio'),
        ]);
        if (!cancelled) {
          setApiStatus(healthRes.ok ? 'online' : 'offline');
        }
        if (!cancelled && portfolioRes.ok) {
          const json = (await portfolioRes.json()) as PortfolioData;
          setData(json);
        }
      } catch {
        if (!cancelled) setApiStatus('offline');
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (selectedProject) {
    return (
      <>
        <PageGrain />
        <CaseStudyView
          project={selectedProject}
          onBack={() => {
            setSelectedProject(null);
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }}
        />
      </>
    );
  }

  return (
    <>
      <PageGrain />

      <header className="topbar">
        <a href="#top" className="topbar__item">
          <span>CH-01 // {data.profile.name}</span>
          <span aria-hidden="true">▶</span>
        </a>
        <a href="#contact" className="topbar__item">
          <span className="topbar__dot" aria-hidden="true" />
          <span>CONTACT</span>
        </a>
      </header>

      <main id="top" className="page-shell">
        <HeroSection
          tagline={data.profile.tagline}
          subTagline={data.profile.subTagline}
          editorialPrefix={data.editorial.headlinePrefix}
          editorialHighlight={data.editorial.headlineHighlight}
        />

        <AboutSection handle={data.profile.handle} apiStatus={apiStatus} />

        <WorkSection
          projects={data.projects}
          onSelectProject={(project) => {
            setSelectedProject(project);
            window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
          }}
        />

        <ArchitectureFlowSection />

        <ServicesSection capabilities={data.capabilities} />

        <ContactSection
          email={data.profile.email}
          githubUrl={data.profile.socials.github}
          linkedinUrl={data.profile.socials.linkedin}
        />

        <footer className="footer-strip">
          <span>© {new Date().getFullYear()} MAHMUDA AKTER · MAHMUDA.SITE</span>
          <span>REACT 19 + VITE + NESTJS 11</span>
        </footer>
      </main>
    </>
  );
}

export default App;
