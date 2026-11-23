export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  architecture: string;
  highlights: string[];
  stack: string[];
  repoUrl: string;
  liveUrl?: string;
  cardTone: 'paper' | 'mist' | 'lilac' | 'stone';
}

export interface CapabilityItem {
  id: string;
  label: string;
  detail: string;
}

export interface PortfolioData {
  profile: {
    name: string;
    handle: string;
    role: string;
    tagline: string;
    subTagline: string;
    bioShort: string;
    bioExtended: string;
    email: string;
    domain: string;
    socials: {
      github: string;
      linkedin: string;
    };
  };
  editorial: {
    headlinePrefix: string;
    headlineHighlight: string;
    headlineSuffix: string;
  };
  projects: ProjectItem[];
  capabilities: CapabilityItem[];
}
