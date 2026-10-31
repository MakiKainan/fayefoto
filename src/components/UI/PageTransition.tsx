import React, { useEffect, useState } from 'react';
import { StarBurst, PERSONA_ASSETS } from './PersonaArt';

/** Time until the screen is fully covered; swap page content at this point. */
export const TRANSITION_COVER_MS = 400;
const TRANSITION_TOTAL_MS = 900;

/**
 * P5-style slash wipe. Increment `playKey` to play it once.
 */
export const PageTransition: React.FC<{ playKey: number }> = ({ playKey }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (playKey === 0) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), TRANSITION_TOTAL_MS);
    return () => clearTimeout(t);
  }, [playKey]);

  if (!active) return null;

  return (
    <div key={playKey} className="fixed inset-0 z-[100] pointer-events-none overflow-hidden motion-reduce:hidden" aria-hidden="true">
      <div className="p5-wipe absolute inset-y-[-10%] left-[-25%] w-[150%] bg-p5-red" />
      <div className="p5-wipe p5-wipe-late absolute inset-y-[-10%] left-[-25%] w-[150%] bg-p5-black flex items-center justify-center">
        <div className="relative flex items-center justify-center" style={{ transform: 'skewX(18deg)' }}>
          <StarBurst className="absolute w-[130vmin] h-[130vmin] animate-spin" style={{ animationDuration: '2.4s' }} rings={12} colors={['#E5191C', '#0F0F0F']} />
          <img src={PERSONA_ASSETS.jokerHand} alt="" className="relative w-[min(80vmin,720px)]" />
        </div>
      </div>
      <div className="p5-wipe p5-wipe-last absolute inset-y-[-10%] left-[-25%] w-[150%] bg-p5-white" style={{ clipPath: 'polygon(0 0, 3% 0, 1% 100%, 0 100%)' }} />
    </div>
  );
};
