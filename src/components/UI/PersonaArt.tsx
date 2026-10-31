import React, { useEffect, useRef } from 'react';

export const PERSONA_ASSETS = {
  jokerCape: '/persona/joker-cape.png',
  jokerGrin: '/persona/joker-grin.png',
  jokerHand: '/persona/joker-hand.png',
  jokerIcon: '/persona/joker-icon.png',
};

function starPoints(cx: number, cy: number, outer: number, inner: number, rotationDeg = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((rotationDeg + i * 36) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/**
 * Concentric black/white star rings from the P5 pause menu collage.
 */
export const StarBurst: React.FC<{
  className?: string;
  rings?: number;
  colors?: [string, string];
  style?: React.CSSProperties;
}> = ({ className = '', rings = 9, colors = ['#0F0F0F', '#FDFDFD'], style }) => {
  const size = 200;
  const c = size / 2;
  const step = (c - 4) / rings;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={className} style={style} aria-hidden="true">
      {Array.from({ length: rings }, (_, i) => {
        const outer = c - 4 - i * step;
        return (
          <polygon
            key={i}
            points={starPoints(c, c, outer, outer * 0.48, -90 + i * 4)}
            fill={colors[i % 2]}
            stroke="#0F0F0F"
            strokeWidth={i === 0 ? 4 : 0}
            strokeLinejoin="miter"
          />
        );
      })}
    </svg>
  );
};

/**
 * One parallax layer. `depth` is how many pixels it travels at full pointer offset;
 * deeper (smaller) values feel further away.
 */
const Layer: React.FC<{ depth: number; scroll?: number; className?: string; children: React.ReactNode }> = ({
  depth,
  scroll = 0,
  className = '',
  children,
}) => (
  <div
    className={`absolute inset-0 will-change-transform ${className}`}
    style={{
      transform: `translate3d(calc(var(--px, 0) * ${-depth}px), calc(var(--py, 0) * ${-depth * 0.6}px + var(--sy, 0) * ${-scroll}px), 0)`,
    }}
  >
    {children}
  </div>
);

/**
 * Full-viewport parallax backdrop in the style of the P5 pause menu:
 * spinning star rings far back, red slashes in the middle, Joker silhouette up front.
 * Layers follow the pointer and scroll at different speeds.
 */
export const PersonaBackdrop: React.FC<{ variant?: 'camera' | 'customize' }> = ({ variant = 'camera' }) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      // Ease towards the pointer so layers glide instead of snapping
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      root.style.setProperty('--px', current.x.toFixed(4));
      root.style.setProperty('--py', current.y.toFixed(4));
      root.style.setProperty('--sy', String(window.scrollY));
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 -z-10 overflow-hidden bg-p5-black pointer-events-none"
      aria-hidden="true"
    >
      {/* Far: giant spinning star rings */}
      <Layer depth={14} scroll={0.05}>
        <div className="absolute right-[-28vmin] bottom-[-38vmin] w-[120vmin] h-[120vmin]">
          <StarBurst className="w-full h-full animate-p5-spin-slow motion-reduce:animate-none" rings={14} colors={['#E5191C', '#0F0F0F']} />
        </div>
        <div className="absolute left-[-14vmin] top-[-14vmin] w-[42vmin] h-[42vmin]">
          <StarBurst
            className="w-full h-full animate-p5-spin-slow motion-reduce:animate-none"
            style={{ animationDirection: 'reverse' }}
            rings={8}
          />
        </div>
      </Layer>

      {/* Middle: red slashes and halftone */}
      <Layer depth={30} scroll={0.12}>
        <svg className="absolute inset-[-4%] w-[108%] h-[108%]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,62 58,100 0,100" fill="#E5191C" />
          <polygon points="0,70 44,100 0,100" fill="#0F0F0F" />
          <polygon points="100,0 100,22 72,0" fill="#E5191C" />
          <polygon points="64,0 66,0 100,30 100,32" fill="#FDFDFD" />
        </svg>
        <div
          className="absolute left-0 bottom-0 w-[60%] h-[40%] p5-halftone opacity-30"
          style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }}
        />
        <div className="absolute right-[18vw] top-[12vh] w-[11vmin] h-[11vmin]">
          <StarBurst className="w-full h-full animate-spin motion-reduce:animate-none" style={{ animationDuration: '12s' }} rings={5} />
        </div>
      </Layer>

      {/* Near: Joker silhouette, swaps per page */}
      <Layer depth={55} scroll={0.22}>
        <img
          src={PERSONA_ASSETS.jokerCape}
          alt=""
          className={`absolute left-[-6vw] bottom-[-2vh] w-[min(68vw,1100px)] transition-all duration-700 ease-out ${
            variant === 'camera' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
          }`}
        />
        <img
          src={PERSONA_ASSETS.jokerGrin}
          alt=""
          className={`absolute right-[-8vw] bottom-[-4vh] w-[min(60vw,1000px)] transition-all duration-700 ease-out ${
            variant === 'customize' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
          }`}
        />
      </Layer>
    </div>
  );
};
