import React from 'react';
import { StarBurst } from '../UI/PersonaArt';
import { PersonaText } from '../../persona/personaTextEngine';

interface CaptureCountdownProps {
  countdownValue: number;
  currentShotNumber: number;
  totalShots: number;
  isFlashActive: boolean;
}

export const CaptureCountdown: React.FC<CaptureCountdownProps> = ({
  countdownValue,
  currentShotNumber,
  totalShots,
  isFlashActive,
}) => {
  return (
    <>
      {/* Shutter flash */}
      {isFlashActive && (
        <div className="absolute inset-0 z-50 bg-p5-white animate-flash pointer-events-none" />
      )}

      {countdownValue > 0 && !isFlashActive && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
          {/* Shot tag */}
          <div className="absolute top-6 right-6 p5-tag-blue text-xl">
            Shot {currentShotNumber}/{totalShots}
          </div>

          {/* Number slammed onto a star */}
          <div key={countdownValue} className="relative flex items-center justify-center animate-p5-pop">
            <StarBurst className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px]" rings={5} colors={['#E5191C', '#0F0F0F']} />
            <span
              className="relative font-display text-[9rem] md:text-[12rem] leading-none text-p5-white select-none"
              style={{ WebkitTextStroke: '6px #0F0F0F', paintOrder: 'stroke fill', textShadow: '8px 8px 0 #0F0F0F' }}
            >
              {countdownValue}
            </span>
          </div>

          <div className="mt-6">
            <PersonaText text="Strike a pose" size="xl" />
          </div>
        </div>
      )}
    </>
  );
};
