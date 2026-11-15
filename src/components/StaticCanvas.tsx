import { useEffect, useRef } from 'react';

interface StaticCanvasProps {
  intensity?: number; // 0.05 to 0.95
  tint?: 'neutral' | 'green' | 'red';
  className?: string;
}

export function StaticCanvas({
  intensity = 0.28,
  tint = 'neutral',
  className = '',
}: StaticCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Aspect-aware higher resolution so analog TV grain is crisp and organic rather than blocky squares
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : 16 / 9;
      const base = 560;
      const w = aspect >= 1 ? base : Math.max(300, Math.round(base * aspect));
      const h = aspect >= 1 ? Math.max(300, Math.round(base / aspect)) : base;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return { w, h };
    };

    let dims = updateSize();
    let imageData = ctx.createImageData(dims.w, dims.h);
    let data = imageData.data;

    let rafId = 0;
    let lastDraw = 0;

    const renderFrame = (time: number) => {
      rafId = requestAnimationFrame(renderFrame);
      if (time - lastDraw < 44) return; // ~23fps authentic VHS tape cadence
      lastDraw = time;

      const nextDims = updateSize();
      if (nextDims.w !== dims.w || nextDims.h !== dims.h) {
        dims = nextDims;
        imageData = ctx.createImageData(dims.w, dims.h);
        data = imageData.data;
      }

      const { w, h } = dims;
      const alphaBase = Math.floor(Math.min(240, Math.max(8, intensity * 215)));
      const scanBand = Math.floor((time * 0.11) % h);
      const tearShift = Math.sin(time * 0.015) * 4;

      for (let y = 0; y < h; y++) {
        const bandDist = Math.abs(y - scanBand);
        const isTearBand = bandDist < 4;
        // Subtle horizontal VHS tracking modulation per scanline
        const rowJitter = Math.random() < 0.06 ? 1.35 : 0.92;

        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const n = Math.random();
          // Fine film/CRT luminance distribution (mostly subtle grain, occasional analog sparkle)
          const grain = (n * 0.65 + Math.random() * 0.35) * 230 * rowJitter;
          const val = isTearBand
            ? Math.min(255, grain * 0.75 + (Math.sin(x * 0.08 + tearShift) > 0.2 ? 95 : 15))
            : Math.min(255, grain);

          if (tint === 'green') {
            data[i] = val * 0.34;
            data[i + 1] = val;
            data[i + 2] = val * 0.42;
          } else if (tint === 'red') {
            data[i] = val;
            data[i + 1] = val * 0.22;
            data[i + 2] = val * 0.22;
          } else {
            data[i] = val * 1.02;
            data[i + 1] = val * 0.98;
            data[i + 2] = val * 0.9;
          }
          data[i + 3] = isTearBand ? Math.min(255, alphaBase + 55) : alphaBase;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    rafId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(rafId);
  }, [intensity, tint]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none w-full h-full object-cover ${className}`}
    />
  );
}
