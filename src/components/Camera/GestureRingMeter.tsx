import React from 'react';
import { GestureType, GestureState } from '../../types/gesture';
import { HandGlyph } from '../UI/HandGlyph';

interface GestureRingMeterProps {
  gesture: GestureType;
  state: GestureState;
  progress: number; // 0 to 1
  cooldownRemaining: number;
  cooldownDurationMs?: number;
}

const GESTURE_ACTIONS: Record<GestureType, string> = {
  VICTORY: 'Take Photos',
  THUMBS_UP: 'Next Layout',
  OPEN_PALM: 'Change Filter',
  FIST: 'Stop',
  NONE: '',
};

/**
 * Hold-to-trigger meter: a skewed P5 banner with a filling slash bar.
 */
export const GestureRingMeter: React.FC<GestureRingMeterProps> = ({
  gesture,
  state,
  progress,
  cooldownRemaining,
  cooldownDurationMs = 2000,
}) => {
  if (gesture === 'NONE' && state !== 'COOLDOWN') return null;

  const isCooldown = state === 'COOLDOWN';
  const fill = isCooldown ? cooldownRemaining / cooldownDurationMs : progress;

  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div
        className="flex items-center gap-3 pl-2 pr-5 py-2 bg-p5-black border-[3px] border-p5-white shadow-[6px_6px_0_#E5191C]"
        style={{ transform: 'rotate(-3deg) skewX(-12deg)' }}
      >
        <div className="flex items-center gap-3" style={{ transform: 'skewX(12deg)' }}>
          {gesture !== 'NONE' && (
            <HandGlyph gesture={gesture} className="w-11 h-11" fill={isCooldown ? '#FDFDFD' : '#E5191C'} />
          )}
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <span className="font-display uppercase text-xl leading-none text-p5-white tracking-wide">
              {isCooldown ? 'Got It' : GESTURE_ACTIONS[gesture]}
            </span>
            <div className="h-3 w-full bg-p5-white border-2 border-p5-white" style={{ transform: 'skewX(-20deg)' }}>
              <div
                className={`h-full ${isCooldown ? 'bg-p5-black' : 'bg-p5-red'}`}
                style={{ width: `${Math.round(fill * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
