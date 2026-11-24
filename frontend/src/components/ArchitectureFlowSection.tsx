import { useEffect, useRef, useState } from 'react';

interface FlowNode {
  id: string;
  label: string;
  sub: string;
  x: number; // normalized 0..1000 SVG coordinate
  y: number; // normalized 0..540 SVG coordinate
  kind: 'input' | 'output';
}

const INPUT_NODES: FlowNode[] = [
  { id: 'react', label: 'React 19', sub: 'Components, state', x: 90, y: 86, kind: 'input' },
  { id: 'ts', label: 'TypeScript', sub: 'Types, contracts', x: 207, y: 86, kind: 'input' },
  { id: 'vite', label: 'Vite', sub: 'Bundles, HMR', x: 324, y: 86, kind: 'input' },
  { id: 'nest', label: 'NestJS 11', sub: 'APIs, validation', x: 441, y: 86, kind: 'input' },
  { id: 'laravel', label: 'Laravel', sub: 'MVC, Eloquent', x: 559, y: 86, kind: 'input' },
  { id: 'mysql', label: 'MySQL', sub: 'Relational data', x: 676, y: 86, kind: 'input' },
  { id: 'mongo', label: 'MongoDB', sub: 'Documents, auth', x: 793, y: 86, kind: 'input' },
  { id: 'git', label: 'Git & CI', sub: 'Workflows, reviews', x: 910, y: 86, kind: 'input' },
];

const OUTPUT_NODES: FlowNode[] = [
  { id: 'webapps', label: 'Web Apps', sub: 'For end users', x: 170, y: 454, kind: 'output' },
  { id: 'apis', label: 'REST APIs', sub: 'For scale', x: 390, y: 454, kind: 'output' },
  { id: 'dashboards', label: 'Dashboards', sub: 'For teams', x: 610, y: 454, kind: 'output' },
  { id: 'cloud', label: 'Production', sub: 'Vercel & custom DNS', x: 830, y: 454, kind: 'output' },
];

const HUB = { x: 500, y: 274 };

function buildCurvePath(node: FlowNode): string {
  if (node.kind === 'input') {
    const c1y = node.y + 108;
    const c2y = HUB.y - 68;
    return `M ${node.x} ${node.y} C ${node.x} ${c1y}, ${HUB.x} ${c2y}, ${HUB.x} ${HUB.y}`;
  }
  const c1y = HUB.y + 84;
  const c2y = node.y - 96;
  return `M ${HUB.x} ${HUB.y} C ${HUB.x} ${c1y}, ${node.x} ${c2y}, ${node.x} ${node.y}`;
}

function evalCubicBezier(
  t: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
): { x: number; y: number } {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const a = mt2 * mt;
  const b = 3 * mt2 * t;
  const c = 3 * mt * t2;
  const d = t2 * t;
  return {
    x: a * x0 + b * x1 + c * x2 + d * x3,
    y: a * y0 + b * y1 + c * y2 + d * y3,
  };
}

function getNodePoint(node: FlowNode, t: number) {
  if (node.kind === 'input') {
    return evalCubicBezier(
      t,
      node.x,
      node.y,
      node.x,
      node.y + 108,
      HUB.x,
      HUB.y - 68,
      HUB.x,
      HUB.y,
    );
  }
  return evalCubicBezier(
    t,
    HUB.x,
    HUB.y,
    HUB.x,
    HUB.y + 84,
    node.x,
    node.y - 96,
    node.x,
    node.y,
  );
}

interface Packet {
  node: FlowNode;
  t: number;
  speed: number;
  r: number;
}

export function ArchitectureFlowSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState(1420);
  const [packets, setPackets] = useState<Array<{ x: number; y: number; r: number; key: string }>>(
    [],
  );
  const [hubPulse, setHubPulse] = useState(0);
  const hoveredRef = useRef<string | null>(null);

  useEffect(() => {
    hoveredRef.current = hoveredId;
  }, [hoveredId]);

  useEffect(() => {
    const allNodes = [...INPUT_NODES, ...OUTPUT_NODES];
    const pool: Packet[] = [];

    // Seed droplets on every branch
    allNodes.forEach((node, idx) => {
      const count = node.kind === 'input' ? 2 : 2;
      for (let j = 0; j < count; j++) {
        pool.push({
          node,
          t: (idx * 0.17 + j * 0.5) % 1,
          speed: 0.0045 + ((idx + j) % 4) * 0.0012,
          r: 3.4 + ((idx + j) % 3) * 1.15,
        });
      }
    });

    let rafId = 0;
    let tickCount = 0;

    const animate = () => {
      tickCount += 1;
      let pulseBump = 0;
      const activeId = hoveredRef.current;

      const rendered = pool.map((p, i) => {
        const isBoosted = activeId === p.node.id || activeId === 'hub';
        p.t += p.speed * (isBoosted ? 2.15 : 1);
        if (p.t >= 1) {
          p.t = 0;
          if (p.node.kind === 'input') {
            pulseBump = 1;
          }
        }
        const pos = getNodePoint(p.node, p.t);
        // Taper radius gently right at start/end so droplets merge smoothly
        const edgeFade = Math.sin(p.t * Math.PI);
        const r = Math.max(2, p.r * (0.65 + 0.5 * edgeFade) * (isBoosted ? 1.25 : 1));
        return { x: pos.x, y: pos.y, r, key: `${p.node.id}-${i}` };
      });

      setPackets(rendered);
      if (pulseBump > 0) {
        setHubPulse(1);
        setSyncedCount((c) => c + 1);
      } else if (tickCount % 3 === 0) {
        setHubPulse((prev) => (prev > 0.02 ? prev * 0.86 : 0));
      }

      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return (
    <section id="architecture" className="flow-section" aria-label="Full-Stack Architecture">
      <div className="flow-card">
        <div className="flow-header">
          <p className="flow-kicker">HOW EVERYTHING CONNECTS</p>
          <p className="flow-sub">Hover any node to trace live data &amp; build flow</p>
        </div>

        <div className="flow-canvas-wrap">
          <svg
            viewBox="0 0 1000 540"
            className="flow-svg"
            role="img"
            aria-label="Full-stack architecture flow from React, TypeScript, Vite, NestJS, Laravel, MySQL, MongoDB, and Git into one unified engineering workflow delivering Web Apps, REST APIs, Dashboards, and Production deployments."
          >
            <defs>
              <filter id="flow-goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
                  result="goo"
                />
              </filter>
            </defs>

            {/* Curved connection lines */}
            {[...INPUT_NODES, ...OUTPUT_NODES].map((node) => {
              const isActive = hoveredId === node.id || hoveredId === 'hub';
              return (
                <path
                  key={`line-${node.id}`}
                  d={buildCurvePath(node)}
                  fill="none"
                  stroke={isActive ? '#111111' : '#cfcec8'}
                  strokeWidth={isActive ? 2 : 1.15}
                  style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
                />
              );
            })}

            {/* Gooey liquid layer: traveling packets + node circles + pulsing central hub */}
            <g filter="url(#flow-goo)">
              {packets.map((p) => (
                <circle key={p.key} cx={p.x} cy={p.y} r={p.r} fill="#0e0e0e" />
              ))}

              {[...INPUT_NODES, ...OUTPUT_NODES].map((node) => {
                const isActive = hoveredId === node.id;
                return (
                  <circle
                    key={`dot-${node.id}`}
                    cx={node.x}
                    cy={node.y}
                    r={isActive ? 13 : node.kind === 'output' ? 9.5 : 7}
                    fill="#0e0e0e"
                    style={{ transition: 'r 0.2s ease' }}
                  />
                );
              })}

              {/* Central pulsing liquid hub */}
              <circle
                cx={HUB.x}
                cy={HUB.y}
                r={30 + hubPulse * 4.5 + (hoveredId === 'hub' ? 5 : 0)}
                fill="#0e0e0e"
                style={{ transition: 'r 0.16s ease' }}
              />
            </g>

            {/* Interactive hit targets & labels for Top Inputs */}
            {INPUT_NODES.map((node) => {
              const isActive = hoveredId === node.id;
              return (
                <g
                  key={`label-${node.id}`}
                  className="flow-node"
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <circle cx={node.x} cy={node.y} r={24} fill="transparent" />
                  <text
                    x={node.x}
                    y={node.y - 34}
                    textAnchor="middle"
                    className={`flow-node__title ${isActive ? 'is-active' : ''}`}
                  >
                    {node.label}
                  </text>
                  <text x={node.x} y={node.y - 19} textAnchor="middle" className="flow-node__sub">
                    {node.sub}
                  </text>
                </g>
              );
            })}

            {/* Center Hub hit target + annotations (left, center-right, right) */}
            <g
              className="flow-node"
              onMouseEnter={() => setHoveredId('hub')}
              onMouseLeave={() => setHoveredId(null)}
            >
              <circle cx={HUB.x} cy={HUB.y} r={44} fill="transparent" />
            </g>

            {/* Left Annotation */}
            <g transform="translate(88, 250)">
              <text x="0" y="0" className="flow-meta-kicker">
                SHARED CONTRACT
              </text>
              <text x="0" y="22" className="flow-meta-title">
                Clean Architecture
              </text>
              <text x="0" y="39" className="flow-meta-sub">
                Typed DTOs, modular services, zero bloat
              </text>
            </g>

            {/* Center Hub Label */}
            <g transform="translate(550, 266)">
              <text x="0" y="0" className="flow-hub-title">
                One full-stack craft
              </text>
              <text x="0" y="18" className="flow-hub-sub">
                Syncing 8 tools · {syncedCount.toLocaleString()} builds
              </text>
            </g>

            {/* Right Annotation (Lifecycle pills) */}
            <g transform="translate(772, 246)">
              <text x="150" y="0" textAnchor="end" className="flow-meta-kicker">
                SHIPPED END-TO-END
              </text>
              <g transform="translate(0, 12)">
                <text x="0" y="13" className="flow-time">
                  ● SPEC
                </text>
                <text x="52" y="13" className="flow-time">
                  ● BUILD
                </text>
                <rect x="102" y="0" width="52" height="19" rx="9.5" fill="#111111" />
                <text x="128" y="13" textAnchor="middle" className="flow-time-live">
                  ● LIVE
                </text>
              </g>
              <text x="152" y="45" textAnchor="end" className="flow-meta-sub">
                Every route verified before deploy.
              </text>
            </g>

            {/* Bottom Output Nodes */}
            {OUTPUT_NODES.map((node) => {
              const isActive = hoveredId === node.id;
              return (
                <g
                  key={`out-${node.id}`}
                  className="flow-node"
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <circle cx={node.x} cy={node.y} r={26} fill="transparent" />
                  <text
                    x={node.x}
                    y={node.y + 32}
                    textAnchor="middle"
                    className={`flow-node__title flow-node__title--out ${
                      isActive ? 'is-active' : ''
                    }`}
                  >
                    {node.label}
                  </text>
                  <text x={node.x} y={node.y + 49} textAnchor="middle" className="flow-node__sub">
                    {node.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
