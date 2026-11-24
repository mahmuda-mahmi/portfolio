import { useEffect, useRef } from 'react';

interface AtomShatterTileProps {
  variant: number;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  // Offset from core center when coalescing
  ox: number;
  oy: number;
  drag: number;
  spring: number;
  isFine: boolean;
}

interface CoreOrb {
  x: number;
  y: number;
  r: number;
}

function computeMorphingOrbs(
  variant: number,
  t: number,
  cx: number,
  cy: number,
  scale: number,
): CoreOrb[] {
  const mode = variant % 4;
  // Smooth periodic morphing like Telemyr's 4 hero marks
  const cycle = (Math.sin(t * 1.1 + variant * 1.3) + 1) * 0.5; // 0..1

  if (mode === 0) {
    // S&OP style: twin/triple orbs bridging into a smooth diagonal/horizontal pill
    const sep = (0.12 + 0.24 * cycle) * scale;
    const angle = Math.sin(t * 0.55) * 0.65;
    const dx = Math.cos(angle) * sep;
    const dy = Math.sin(angle) * sep;
    return [
      { x: cx - dx, y: cy - dy, r: scale * (0.17 + 0.04 * (1 - cycle)) },
      { x: cx, y: cy, r: scale * (0.22 - 0.03 * cycle) },
      { x: cx + dx, y: cy + dy, r: scale * (0.17 + 0.04 * (1 - cycle)) },
    ];
  }

  if (mode === 1) {
    // Data Analytics style: 4-lobe organic clover morphing into a single solid sphere
    const spread = (0.04 + 0.22 * cycle) * scale;
    const rot = t * 0.45;
    const orbs: CoreOrb[] = [];
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      orbs.push({
        x: cx + Math.cos(a) * spread,
        y: cy + Math.sin(a) * spread,
        r: scale * (0.21 - 0.03 * cycle),
      });
    }
    return orbs;
  }

  if (mode === 2) {
    // Automation style: 3 liquid orbs oscillating between a solid sphere and a wave
    const spread = (0.03 + 0.28 * cycle) * scale;
    const wave = Math.sin(t * 1.8) * 0.08 * scale * cycle;
    return [
      { x: cx - spread, y: cy + wave, r: scale * 0.19 },
      { x: cx, y: cy - wave, r: scale * (0.22 - 0.03 * cycle) },
      { x: cx + spread, y: cy + wave, r: scale * 0.19 },
    ];
  }

  // AI Enablement style: diagonal pill / twin merging droplets
  const spread = (0.04 + 0.2 * cycle) * scale;
  const a = -Math.PI / 4 + Math.sin(t * 0.7) * 0.35;
  return [
    { x: cx - Math.cos(a) * spread, y: cy - Math.sin(a) * spread, r: scale * 0.21 },
    { x: cx + Math.cos(a) * spread, y: cy + Math.sin(a) * spread, r: scale * 0.21 },
  ];
}

export function AtomShatterTile({ variant }: AtomShatterTileProps) {
  const gooCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const crispCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const gooCanvas = gooCanvasRef.current;
    const crispCanvas = crispCanvasRef.current;
    if (!wrap || !gooCanvas || !crispCanvas) return;

    const gooCtx = gooCanvas.getContext('2d');
    const crispCtx = crispCanvas.getContext('2d');
    if (!gooCtx || !crispCtx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 220;
    let height = 200;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(120, rect.width);
      height = Math.max(120, rect.height);
      for (const c of [gooCanvas, crispCanvas]) {
        c.width = Math.floor(width * dpr);
        c.height = Math.floor(height * dpr);
      }
      gooCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      crispCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pre-allocate droplet pool (only visible & scattering when shattered)
    let seed = (variant + 3) * 7919 + 104729;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const droplets: Droplet[] = Array.from({ length: 82 }, () => {
      const angle = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand()) * 22;
      const sizeRoll = rand();
      const r =
        sizeRoll < 0.45
          ? 1.4 + rand() * 2.1
          : sizeRoll < 0.82
            ? 3.8 + rand() * 3.4
            : 7.4 + rand() * 5.2;
      return {
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0,
        r,
        ox: Math.cos(angle) * dist,
        oy: Math.sin(angle) * dist,
        drag: 0.84 + rand() * 0.08,
        spring: 0.055 + rand() * 0.05,
        isFine: r < 4.5,
      };
    });

    const pointer = {
      x: -999,
      y: -999,
      active: false,
      lastX: 0,
      lastY: 0,
      vx: 0,
      vy: 0,
    };

    // 0 = pure intact liquid metaball, 1 = fully shattered into ink spray
    let shatter = 0;

    const triggerBurst = (px: number, py: number, boost: number) => {
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < droplets.length; i++) {
        const d = droplets[i];
        if (shatter < 0.15) {
          d.x = cx + d.ox;
          d.y = cy + d.oy;
        }
        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx) + (Math.sin(i * 1.7) * 0.55);
        const power = (5 + (i % 7) * 1.4 + boost) * Math.max(0.35, 1 - dist / 160);
        d.vx += Math.cos(angle) * power + pointer.vx * 0.22;
        d.vy += Math.sin(angle) * power + pointer.vy * 0.22;
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      if (pointer.active) {
        pointer.vx = Math.max(-24, Math.min(24, nx - pointer.lastX));
        pointer.vy = Math.max(-24, Math.min(24, ny - pointer.lastY));
      } else {
        pointer.vx = 0;
        pointer.vy = 0;
        triggerBurst(nx, ny, 6);
      }
      pointer.lastX = nx;
      pointer.lastY = ny;
      pointer.x = nx;
      pointer.y = ny;
      pointer.active = true;
    };

    const onLeave = () => {
      pointer.active = false;
      pointer.x = -999;
      pointer.y = -999;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    let rafId = 0;
    let time = variant * 1.7;

    const render = () => {
      time += 0.024;
      gooCtx.clearRect(0, 0, width, height);
      crispCtx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.46;

      // Check cursor proximity to center cluster
      const distToCenter = pointer.active ? Math.hypot(pointer.x - cx, pointer.y - cy) : 999;
      const isHoveringCluster = pointer.active && distToCenter < scale * 1.05;

      // Smoothly transition shatter state (snappy burst on enter, liquid coalesce on leave)
      const targetShatter = isHoveringCluster ? 1 : 0;
      shatter += (targetShatter - shatter) * (isHoveringCluster ? 0.28 : 0.075);

      // 1. Draw morphing liquid metaball core (shrinks away while fully shattered)
      const coreScale = Math.max(0, 1 - shatter * 0.92);
      if (coreScale > 0.02) {
        const orbs = computeMorphingOrbs(variant, time, cx, cy, scale);
        gooCtx.fillStyle = '#0e0e0e';
        for (const orb of orbs) {
          gooCtx.beginPath();
          gooCtx.arc(orb.x, orb.y, orb.r * coreScale, 0, Math.PI * 2);
          gooCtx.fill();
        }
      }

      // 2. Update & draw shattered ink droplets
      if (shatter > 0.015) {
        const haloRadius = Math.min(width, height) * 0.34;
        gooCtx.fillStyle = '#0e0e0e';
        crispCtx.fillStyle = '#0e0e0e';

        for (let i = 0; i < droplets.length; i++) {
          const d = droplets[i];
          const homeX = cx + d.ox * 0.45;
          const homeY = cy + d.oy * 0.45;

          // Pull back toward liquid core
          const pull = isHoveringCluster ? d.spring * 0.42 : d.spring * 1.45;
          d.vx += (homeX - d.x) * pull;
          d.vy += (homeY - d.y) * pull;

          // Circular cursor exclusion halo (pushes droplets into organic Telemyr arc)
          if (pointer.active) {
            const dx = d.x - pointer.x;
            const dy = d.y - pointer.y;
            const dist = Math.hypot(dx, dy) || 0.001;
            if (dist < haloRadius) {
              const f = ((haloRadius - dist) / haloRadius) * 7.5;
              d.vx += (dx / dist) * f + pointer.vx * 0.08;
              d.vy += (dy / dist) * f + pointer.vy * 0.08;
            }
          }

          d.vx *= d.drag;
          d.vy *= d.drag;
          d.x += d.vx;
          d.y += d.vy;

          // Soft tile containment
          const pad = d.r + 3;
          if (d.x < pad) {
            d.x = pad;
            d.vx *= -0.4;
          } else if (d.x > width - pad) {
            d.x = width - pad;
            d.vx *= -0.4;
          }
          if (d.y < pad) {
            d.y = pad;
            d.vy *= -0.4;
          } else if (d.y > height - pad) {
            d.y = height - pad;
            d.vy *= -0.4;
          }

          const radius = d.r * Math.min(1, shatter * 1.35);
          if (d.isFine) {
            crispCtx.beginPath();
            crispCtx.arc(d.x, d.y, radius, 0, Math.PI * 2);
            crispCtx.fill();
          } else {
            gooCtx.beginPath();
            gooCtx.arc(d.x, d.y, radius, 0, Math.PI * 2);
            gooCtx.fill();
          }
        }
      } else {
        // Keep pool centered when completely reformed
        for (const d of droplets) {
          d.x = cx + d.ox * 0.4;
          d.y = cy + d.oy * 0.4;
          d.vx = 0;
          d.vy = 0;
        }
      }

      pointer.vx *= 0.8;
      pointer.vy *= 0.8;
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [variant]);

  return (
    <div ref={wrapRef} className="wg-art__stage" aria-hidden="true">
      <canvas ref={gooCanvasRef} className="wg-art__canvas wg-art__canvas--goo" />
      <canvas ref={crispCanvasRef} className="wg-art__canvas wg-art__canvas--crisp" />
    </div>
  );
}
