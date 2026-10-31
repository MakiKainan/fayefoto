import React from 'react';
import { GestureType } from '../../types/gesture';
import { HandGlyph } from './HandGlyph';

interface GestureHUDProps {
  activeGesture: GestureType;
  handDetected: boolean;
}

const GESTURE_ITEMS: { type: Exclude<GestureType, 'NONE'>; action: string; offset: string }[] = [
  { type: 'VICTORY', action: 'Take Photos', offset: 'lg:ml-0' },
  { type: 'THUMBS_UP', action: 'Next Layout', offset: 'lg:ml-6' },
  { type: 'OPEN_PALM', action: 'Cycle Filter', offset: 'lg:ml-3' },
  { type: 'FIST', action: 'Retake', offset: 'lg:ml-9' },
];

/**
 * Gesture command list, laid out like the staggered P5 pause menu.
 */
export const GestureHUD: React.FC<GestureHUDProps> = ({ activeGesture, handDetected }) => {
  return (
    <div className="w-full flex flex-col gap-4">
      <span className={handDetected ? 'p5-heading self-start' : 'p5-tag-blue self-start'}>
        {handDetected ? 'Hand Locked' : 'Show Your Hand'}
      </span>

      <ul className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-2.5">
        {GESTURE_ITEMS.map((item, i) => {
          const isActive = activeGesture === item.type;
          return (
            <li
              key={item.type}
              className={`${item.offset} animate-p5-slide`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`flex items-center gap-3 pl-2 pr-4 py-1.5 border-[3px] transition-transform duration-150 ${
                  isActive
                    ? 'bg-p5-white text-p5-black border-p5-black shadow-[6px_6px_0_#E5191C]'
                    : 'bg-p5-black text-p5-white border-p5-white shadow-[5px_5px_0_#0F0F0F]'
                }`}
                style={{ transform: `skewX(-12deg)${isActive ? ' translateX(8px) rotate(-2deg)' : ''}` }}
              >
                <div style={{ transform: 'skewX(12deg)' }} className="flex items-center gap-3">
                  <HandGlyph
                    gesture={item.type}
                    className="w-10 h-10 shrink-0"
                    fill={isActive ? '#E5191C' : '#FDFDFD'}
                  />
                  <span className="font-display uppercase text-lg sm:text-xl leading-none tracking-wide">
                    {item.action}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
