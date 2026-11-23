import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';

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
  previewImage?: string;
  previewVideo?: string;
  cardTone: 'paper' | 'mist' | 'lilac' | 'stone';
}

export interface CapabilityItem {
  id: string;
  label: string;
  detail: string;
}

@Injectable()
export class PortfolioService {
  getPortfolioData() {
    return {
      profile: {
        name: 'Mahmuda Akter',
        handle: 'mahmuda-mahmi',
        role: 'Software Developer',
        tagline: 'TURNING INTENTIONAL CODE INTO RESILIENT DIGITAL SYSTEMS',
        subTagline:
          'BUILDING FULL-STACK WEB APPLICATIONS, SCALABLE APIS, AND CLEAN INTERFACES FOR PRODUCTS THAT LAST',
        bioShort:
          'with a foundation in full-stack engineering and a deep appreciation for craft · mahmuda brings structure to modern software',
        bioExtended:
          'integrating React, TypeScript, NestJS, and Laravel/PHP to build reliable, user-focused web ecosystems from database schema to pixel-crisp UI.',
        email: 'hello@mahmuda.site',
        domain: 'https://mahmuda.site',
        socials: {
          github: 'https://github.com/mahmuda-mahmi',
          linkedin: 'https://www.linkedin.com/in/mahmuda-mahmi/',
        },
      },
      editorial: {
        headlinePrefix: 'SHIPPING A WEB APP HAS NEVER BEEN',
        headlineHighlight: 'EASIER',
        headlineSuffix: '— YET CRAFTING SOFTWARE THAT FEELS INTENTIONAL STILL TAKES ENGINEERING RIGOR.',
      },
      projects: [
        {
          id: '01',
          slug: 'infotub',
          title: 'InfoTub',
          category: 'Full-Stack Web Platform',
          year: '2026',
          summary:
            'A structured knowledge and content hub built with Laravel, Blade, and MySQL—focused on clean information architecture and fast server-rendered workflows.',
          architecture:
            'MVC architecture with relational MySQL schemas, form request validation, and modular Blade components.',
          highlights: [
            'Role-aware authentication and CRUD pipelines',
            'Clean relational data modeling in MySQL',
            'Responsive editorial layout with zero bloat',
          ],
          stack: ['Laravel', 'PHP', 'Blade', 'MySQL'],
          repoUrl: 'https://github.com/mahmuda-mahmi/InfoTub',
          previewImage: '/previews/infotub.svg',
          cardTone: 'paper',
        },
        {
          id: '02',
          slug: 'tweety',
          title: 'Tweety',
          category: 'Social Microblogging App',
          year: '2026',
          summary:
            'A real-time-feeling social feed and microblogging platform featuring user timelines, follows, likes, and profile customization.',
          architecture:
            'Eloquent ORM relationships for follower graphs, feed pagination, and policy-driven authorization.',
          highlights: [
            'Follower/following graph with optimized timeline queries',
            'Interactive likes, replies, and profile editing',
            'Policy-protected routes and clean UI feedback',
          ],
          stack: ['Laravel', 'PHP', 'MySQL', 'Tailwind CSS'],
          repoUrl: 'https://github.com/mahmuda-mahmi/tweety',
          previewImage: '/previews/tweety.svg',
          cardTone: 'mist',
        },
        {
          id: '03',
          slug: 'realsolution',
          title: 'Solution Art',
          category: 'Design & Engineering Showcase',
          year: '2026',
          summary:
            'An interactive agency-style web experience exploring precision layout grids, typographic hierarchy, and tactile UI states.',
          architecture:
            'Semantic HTML5, modular CSS custom properties, and lightweight vanilla JavaScript interactions.',
          highlights: [
            'Grid-driven Swiss editorial layout system',
            'Smooth interactive state transitions',
            'Fast static delivery with accessible markup',
          ],
          stack: ['TypeScript', 'HTML5', 'CSS3', 'JavaScript'],
          repoUrl: 'https://github.com/mahmuda-mahmi/realsolution',
          previewImage: '/previews/realsolution.svg',
          cardTone: 'lilac',
        },
        {
          id: '04',
          slug: 'coffee-store',
          title: 'Coffee Store',
          category: 'Full-Stack E-Commerce',
          year: '2025',
          summary:
            'An end-to-end storefront with authenticated user sessions, product catalog management, and a RESTful Express & MongoDB backend.',
          architecture:
            'Decoupled React client communicating with a Node.js / Express REST API backed by MongoDB.',
          highlights: [
            'Firebase & token-based authentication flow',
            'Full CRUD product management with live state sync',
            'Modular React component architecture',
          ],
          stack: ['React', 'Node.js', 'Express', 'MongoDB'],
          repoUrl: 'https://github.com/mahmuda-mahmi/coffee-store-client-with-auth',
          previewImage: '/previews/coffee-store.svg',
          cardTone: 'stone',
        },
      ] satisfies ProjectItem[],
      capabilities: [
        {
          id: 'cap-1',
          label: 'FRONTEND ARCHITECTURE',
          detail: 'React 19, TypeScript, Vite, Tailwind CSS, accessible & responsive UI systems',
        },
        {
          id: 'cap-2',
          label: 'BACKEND & API ENGINEERING',
          detail: 'NestJS 11, Node.js, Express, Laravel & PHP, RESTful design & validation',
        },
        {
          id: 'cap-3',
          label: 'DATABASE & DATA MODELING',
          detail: 'MySQL, PostgreSQL, MongoDB, schema design & query optimization',
        },
        {
          id: 'cap-4',
          label: 'AUTHENTICATION & SECURITY',
          detail: 'JWT, OAuth, role-based access control, input sanitization',
        },
        {
          id: 'cap-5',
          label: 'CLOUD & DEPLOYMENT',
          detail: 'GitHub workflows, Vercel serverless & edge delivery, DNS & custom domains',
        },
        {
          id: 'cap-6',
          label: 'DESIGN-TO-CODE CRAFT',
          detail: 'Translating editorial typography, motion, and micro-interactions into production',
        },
      ] satisfies CapabilityItem[],
    };
  }

  submitContact(dto: CreateContactDto) {
    return {
      ok: true,
      receivedAt: new Date().toISOString(),
      sender: dto.name,
      message: `Thanks ${dto.name}, your message has been received.`,
    };
  }
}
