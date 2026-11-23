import type { CapabilityItem } from '../types/portfolio';

interface ServicesSectionProps {
  capabilities: CapabilityItem[];
}

export function ServicesSection({ capabilities }: ServicesSectionProps) {
  return (
    <section id="services" className="services-section" aria-label="Capabilities">
      <div className="services-wrap">
        <h2 className="services-kicker">
          EVERY PROJECT BRIDGES LOGIC
          <br />
          WITH ARTISTRY:
        </h2>
        <ul className="services-list">
          {capabilities.map((cap) => (
            <li key={cap.id} className="service-item">
              <span>▶ {cap.label}</span>
              <span className="service-item__detail">{cap.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
