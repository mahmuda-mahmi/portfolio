import { useEffect, useRef } from 'react';

interface AtomShatterTileProps {
  variant: number;
}

interface AtomParticle {
  // Normalized shape anchor (-1..1)
  ax: number;
  ay: number;
  // Current position in px
  x: number;
  y: number;
  // Velocity
  vx: number;
  vy: number;
  // Base radius (heterogeneous droplets: 1.5px specks up to 8px blobs)
  r: number;
  // Phase for organic breathing/morphing
  phase: number;
  orbit: number;
}

function generateClusterAnchors(variant: number, count: number): Array<{ ax: number; ay: number; r: number }> {
  const pts: Array<{ ax: number; ay: number; r: number }> = [];
  const mode = variant % 6;

  // Deterministic pseudo-random helper so each tile has a distinct repeatable look
  let seed = (variant + 1) * 9301 + 49297;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    let ax = 0;
    let ay = 0;

    if (mode === 0) {
      // 3-orb horizontal capsule (like Telemyr S&OP)
      const pick = rand();
      const angle = rand() * Math.PI * 2;
      if (pick < 0.5) {
        const rad = Math.sqrt(rand()) * 0.26;
        ax = Math.cos(angle) * rad;
        ay = Math.sin(angle) * rad;
      } else if (pick < 0.75) {
        const rad = Math.sqrt(rand()) * 0.16;
        ax = -0.34 + Math.cos(angle) * rad;
        ay = Math.sin(angle) * rad;
      } else {
        const rad = Math.sqrt(rand()) * 0.16;
        ax = 0.34 + Math.cos(angle) * rad;
        ay = Math.sin(angle) * rad;
      }
    } else if (mode === 1) {
      // 5-petal organic flower ring (like Telemyr Data Analytics)
      const lobe = 0.32 + 0.11 * Math.cos(5 * t);
      const thick = (rand() - 0.5) * 0.14;
      ax = Math.cos(t) * (lobe + thick);
      ay = Math.sin(t) * (lobe + thick);
    } else if (mode === 2) {
      // Morphing horizontal wave pill (like Telemyr Automation)
      const u = (rand() - 0.5) * 0.72;
      const v = (rand() - 0.5) * (0.24 + 0.08 * Math.cos(u * 9));
      ax = u;
      ay = v;
    } else if (mode === 3) {
      // Diagonal capsule / twin droplet (like Telemyr AI Enablement)
      const u = (rand() - 0.5) * 0.48;
      const v = (rand() - 0.5) * 0.26;
      const cos = Math.cos(Math.PI / 4);
      const sin = Math.sin(Math.PI / 4);
      ax = u * cos - v * sin;
      ay = u * sin + v * cos;
    } else if (mode === 4) {
      // 3-node constellation triad
      const nodes = [
        { x: -0.28, y: 0.18, s: 0.17 },
        { x: 0.06, y: -0.2, s: 0.2 },
        { x: 0.3, y: 0.18, s: 0.17 },
      ];
      const n = nodes[i % 3];
      const angle = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand()) * n.s;
      ax = n.x + Math.cos(angle) * rad;
      ay = n.y + Math.sin(angle) * rad;
    } else {
      // Hollow organic atom ring
      const rad = 0.3 + (rand() - 0.5) * 0.12;
      ax = Math.cos(t) * rad;
      ay = Math.sin(t) * rad;
    }

    // Heterogeneous droplet sizing: mix of core blobs and fine satellite specks
    const sizeRoll = rand();
    const r =
      sizeRoll < 0.35
        ? 1.8 + rand() * 2.2
        : sizeRoll < 0.75
          ? 4.2 + rand() * 3.8
          : 7.5 + rand() * 4.5;

    pts.push({ ax, ay, r });
  }

  return pts;
}

export function AtomShatterTile({ variant }: AtomShatterTileProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 220;
    let height = 200;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(120, rect.width);
      height = Math.max(120, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const anchors = generateClusterAnchors(variant, 98);
    const scale = () => Math.min(width, height) * 0.42;

    const particles: AtomParticle[] = anchors.map((a, idx) => {
      const s = scale();
      return {
        ax: a.ax,
        ay: a.ay,
        x: width / 2 + a.ax * s,
        y: height / 2 + a.ay * s,
        vx: 0,
        vy: 0,
        r: a.r,
        phase: idx * 0.37 + variant,
        orbit: 1.5 + (idx % 5) * 0.55,
      };
    });

    const pointer = { x: -999, y: -999, active: false, speed: 0, lastX: 0, lastY: 0 };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = e.clientX - rect.left;
      const ny = e.clientY - rect.top;
      if (pointer.active) {
        const dx = nx - pointer.lastX;
        const dy = ny - pointer.lastY;
        pointer.speed = Math.min(35, Math.hypot(dx, dy));
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
      pointer.speed = 0;
    };

    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    let rafId = 0;
    let time = 0;

    const frame = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const s = scale();
      const repelRadius = Math.min(width, height) * 0.36;

      ctx.fillStyle = '#181818';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gentle organic breathing around home silhouette
        const breathe = 1 + 0.045 * Math.sin(time * 1.4 + variant);
        const homeX = cx + p.ax * s * breathe + Math.cos(time + p.phase) * p.orbit;
        const homeY = cy + p.ay * s * breathe + Math.sin(time * 0.9 + p.phase) * p.orbit;

        // Spring pull back to home
        p.vx += (homeX - p.x) * 0.085;
        p.vy += (homeY - p.y) * 0.085;

        // Cursor repulsion halo (shatters into atoms!)
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < repelRadius) {
            const force = ((repelRadius - dist) / repelRadius) * (12.5 + pointer.speed * 0.45);
            const angle = Math.atan2(dy, dx) + (Math.sin(p.phase) * 0.25);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }

        // Smooth liquid damping
        p.vx *= 0.8;
        p.vy *= 0.8;
        p.x += p.vx;
        p.y += p.vy;

        // Keep particles inside tile bounds with soft bounce
        if (p.x < p.r) {
          p.x = p.r;
          p.vx *= -0.4;
        } else if (p.x > width - p.r) {
          p.x = width - p.r;
          p.vx *= -0.4;
        }
        if (p.y < p.r) {
          p.y = p.r;
          p.vy *= -0.4;
        } else if (p.y > height - p.r) {
          p.y = height - p.r;
          p.vy *= -0.4;
        }

        // Shrink slightly when scattered fast for crisp fine-droplet look
        const vel = Math.hypot(p.vx, p.vy);
        const drawR = Math.max(1.4, p.r * (1 - Math.min(0.42, vel * 0.028)));

        ctx.beginPath();
        ctx.arc(p.x, p.y, drawR, 0, Math.PI * 2);
        ctx.fill();
      }

      pointer.speed *= 0.85;
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="wg-art__canvas"
      aria-hidden="true"
    />
  );
}
