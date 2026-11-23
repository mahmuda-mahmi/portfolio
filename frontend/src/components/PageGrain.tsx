import { useEffect, useRef } from 'react';

export function PageGrain() {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // Generate a crisp 1:1 256x256 monochrome film-grain tile (no upscaling blur)
    const size = 256;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    const img = ctx.createImageData(size, size);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    el.style.backgroundImage = `url(${offscreen.toDataURL('image/png')})`;
    el.style.backgroundRepeat = 'repeat';
    el.style.backgroundSize = `${size}px ${size}px`;

    // Animate grain subtly at ~18fps by shifting tile offset (zero CPU overhead)
    let rafId = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last > 55) {
        last = now;
        const ox = Math.floor(Math.random() * size);
        const oy = Math.floor(Math.random() * size);
        el.style.backgroundPosition = `${ox}px ${oy}px`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return <div ref={divRef} className="page-grain" aria-hidden="true" />;
}
