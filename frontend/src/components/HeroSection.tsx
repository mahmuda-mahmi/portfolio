import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  tagline: string;
  subTagline: string;
  editorialPrefix: string;
  editorialHighlight: string;
}

function VhsNoiseCanvas({ seedOffset = 0 }: { seedOffset?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 96;
    const h = 84;
    canvas.width = w;
    canvas.height = h;

    let rafId = 0;
    let frame = seedOffset;

    const renderNoise = () => {
      frame += 1;
      if (frame % 3 === 0) {
        const img = ctx.createImageData(w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const base = 32 + Math.random() * 74;
          d[i] = base + (Math.random() > 0.92 ? 32 : 0);
          d[i + 1] = base + (Math.random() > 0.94 ? 22 : 0);
          d[i + 2] = base + (Math.random() > 0.88 ? 42 : 6);
          d[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      }
      rafId = window.requestAnimationFrame(renderNoise);
    };

    rafId = window.requestAnimationFrame(renderNoise);
    return () => window.cancelAnimationFrame(rafId);
  }, [seedOffset]);

  return <canvas ref={canvasRef} className="hero-block__noise" aria-hidden="true" />;
}

function formatTimecode(seconds: number): string {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

const TOP_ROW = ['M', 'A', 'H', 'M', 'U', 'D', 'A'];
const BOT_ROW = ['', 'A', 'K', 'T', 'E', 'R', 'DEV'];
const SMPTE_COLORS = [
  '#f9f8f6',
  '#e8d44d',
  '#5fe8e8',
  '#6ee787',
  '#ff6ba8',
  '#ff5252',
  '#bfa8f5',
];

export function HeroSection({
  tagline,
  subTagline,
  editorialPrefix,
  editorialHighlight,
}: HeroSectionProps) {
  const [elapsed, setElapsed] = useState(1);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const tvLostRef = useRef<HTMLDivElement | null>(null);
  const captionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const pinEl = pinRef.current;
    if (!pinEl) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 769px)', () => {
        const blocks = gsap.utils.toArray<HTMLElement>('.hero-block');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinEl,
            start: 'top top',
            end: '+=1000',
            scrub: 0.75,
            pin: true,
            anticipatePin: 1,
          },
        });

        if (captionsRef.current) {
          tl.to(captionsRef.current, { opacity: 0, y: -14, duration: 0.2 }, 0);
        }

        // Cleanly drop & fade ALL hero letter tiles (no leftover gibberish letters)
        blocks.forEach((el, i) => {
          const col = i % 7;
          const row = Math.floor(i / 7);
          tl.to(
            el,
            {
              y: 420 + row * 50,
              rotation: (col - 3) * 6,
              opacity: 0,
              duration: 0.45,
              ease: 'power2.in',
            },
            col * 0.025 + row * 0.03,
          );
        });

        // Reveal left editorial statement & right Old TV "CONNECTION LOST" monitor
        if (overlayRef.current) {
          tl.fromTo(
            overlayRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.38,
          );
        }

        if (tvLostRef.current) {
          tl.fromTo(
            tvLostRef.current,
            { opacity: 0, scale: 0.96, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.38,
          );
        }
      });
    }, pinRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={pinRef} className="hero-pin-wrap" aria-label="Introduction">
      <div className="hero-stage">
        <div ref={overlayRef} className="hero-editorial-overlay">
          <p className="hero-editorial-kicker">TODAY,</p>
          <h1 className="hero-editorial-title">
            {editorialPrefix}{' '}
            <span className="hero-editorial-invert">{editorialHighlight}</span>...
          </h1>
        </div>

        {/* Old TV Connection Lost Monitor (replaces tiles cleanly on scroll) */}
        <div ref={tvLostRef} className="hero-tv-lost" aria-hidden="true">
          <VhsNoiseCanvas seedOffset={99} />
          <div className="hero-tv-lost__bars">
            {SMPTE_COLORS.map((hex) => (
              <div key={hex} style={{ backgroundColor: hex }} />
            ))}
          </div>

          <div className="hero-tv-lost__center">
            <span className="hero-tv-lost__badge">CONNECTION LOST</span>
            <span className="hero-tv-lost__sub">NO SIGNAL // TUNING CH-03</span>
          </div>

          <div className="hero-tv-lost__osd">
            <span>● AV-1</span>
            <span>{formatTimecode(elapsed)}</span>
          </div>
        </div>

        <div className="hero-world">
          {/* Row 0: M A H M U D A */}
          {TOP_ROW.map((char, idx) => (
            <div key={`r0-${idx}`} className="hero-block">
              <VhsNoiseCanvas seedOffset={idx * 7} />
              {idx === 0 && <span className="hero-block__osd hero-block__osd--tl">PLAY ▶</span>}
              <span className="hero-block__letter">{char}</span>
            </div>
          ))}

          {/* Row 1: VHS Static */}
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={`r1-${idx}`}
              className={`hero-block ${idx > 3 ? 'hero-block--hide-sm' : ''}`}
            >
              <VhsNoiseCanvas seedOffset={30 + idx * 11} />
              {idx === 0 && <span className="hero-block__osd hero-block__osd--bl">SP</span>}
              {idx === 3 && (
                <span
                  className="hero-block__osd"
                  style={{ fontSize: '0.78rem', color: '#bfa8f5' }}
                >
                  CH-03 // NO SIGNAL
                </span>
              )}
            </div>
          ))}

          {/* Row 2: [static] A K T E R [DEV] */}
          {BOT_ROW.map((char, idx) => (
            <div
              key={`r2-${idx}`}
              className={`hero-block ${
                idx === 6 ? 'hero-block--avatar' : ''
              } ${idx === 0 ? 'hero-block--hide-sm' : ''}`}
            >
              {idx !== 6 && <VhsNoiseCanvas seedOffset={70 + idx * 13} />}
              {char && idx !== 6 && <span className="hero-block__letter">{char}</span>}
              {idx === 5 && (
                <span className="hero-block__osd hero-block__osd--br">
                  {formatTimecode(elapsed)}
                </span>
              )}
              {idx === 6 && (
                <>
                  <span className="hero-block__osd hero-block__osd--tl" style={{ color: '#bfa8f5' }}>
                    ● REC
                  </span>
                  <span className="hero-block__letter" style={{ fontSize: '2rem' }}>
                    DEV
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        <div ref={captionsRef}>
          <div className="hero-captions">
            <p className="mono-copy hero-captions__left">{tagline}</p>
            <p className="mono-copy hero-captions__right">{subTagline}</p>
          </div>
          <div className="scroll-hint">
            <span>scroll down</span>
            <span className="caret" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
