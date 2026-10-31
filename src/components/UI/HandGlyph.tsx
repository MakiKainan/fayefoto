import React from 'react';
import { GestureType } from '../../types/gesture';

/**
 * Flat vector hand silhouettes in the Persona 5 cut-out style:
 * solid fill, heavy black outline, no gradients.
 * Shapes are drawn twice (fat black pass, then fill pass) so overlapping
 * parts merge into one clean silhouette.
 */
interface Capsule {
  x: number;
  y: number;
  w: number;
  h: number;
  rot?: [number, number, number];
}

const FINGER_W = 9;
const fingerX = (center: number) => center - FINGER_W / 2;
const CENTERS = [20.5, 29, 37.5, 46];

const SHAPES: Record<Exclude<GestureType, 'NONE'>, { parts: Capsule[]; details: string[] }> = {
  OPEN_PALM: {
    parts: [
      { x: 16, y: 30, w: 34, h: 26 },
      { x: fingerX(CENTERS[0]), y: 9, w: FINGER_W, h: 28, rot: [-8, CENTERS[0], 34] },
      { x: fingerX(CENTERS[1]), y: 5, w: FINGER_W, h: 30, rot: [-2, CENTERS[1], 34] },
      { x: fingerX(CENTERS[2]), y: 7, w: FINGER_W, h: 29, rot: [4, CENTERS[2], 34] },
      { x: fingerX(CENTERS[3]), y: 13, w: FINGER_W, h: 24, rot: [12, CENTERS[3], 34] },
      { x: 9.5, y: 30, w: FINGER_W, h: 24, rot: [-48, 14, 50] },
    ],
    details: [],
  },
  VICTORY: {
    parts: [
      { x: 16, y: 30, w: 34, h: 26 },
      { x: fingerX(CENTERS[0]), y: 5, w: FINGER_W, h: 32, rot: [-14, CENTERS[0], 34] },
      { x: fingerX(CENTERS[1]), y: 4, w: FINGER_W, h: 32, rot: [10, CENTERS[1], 34] },
      { x: fingerX(CENTERS[2]), y: 24, w: FINGER_W, h: 14 },
      { x: fingerX(CENTERS[3]), y: 26, w: FINGER_W, h: 13 },
      { x: 24, y: 37, w: 24, h: 9 },
    ],
    details: ['M42 27 L42 36', 'M26 46.5 L44 46.5'],
  },
  FIST: {
    parts: [
      { x: 14, y: 27, w: 36, h: 29 },
      { x: fingerX(CENTERS[0]), y: 20, w: FINGER_W, h: 15 },
      { x: fingerX(CENTERS[1]), y: 18, w: FINGER_W, h: 16 },
      { x: fingerX(CENTERS[2]), y: 19, w: FINGER_W, h: 15 },
      { x: fingerX(CENTERS[3]), y: 22, w: FINGER_W, h: 13 },
      { x: 12, y: 39, w: 28, h: 10 },
    ],
    details: ['M24.75 22 L24.75 32', 'M33.25 21 L33.25 32', 'M41.75 22 L41.75 32', 'M14 49.5 L38 49.5'],
  },
  THUMBS_UP: {
    parts: [
      { x: 14, y: 28, w: 28, h: 28 },
      { x: 30, y: 28, w: 20, h: 8 },
      { x: 30, y: 35, w: 20, h: 8 },
      { x: 30, y: 42, w: 19, h: 8 },
      { x: 30, y: 49, w: 17, h: 7 },
      { x: 15, y: 5, w: 11, h: 30, rot: [-6, 20, 34] },
    ],
    details: ['M34 35.5 L48 35.5', 'M34 42.5 L48 42.5', 'M34 49.5 L46 49.5'],
  },
};

interface HandGlyphProps {
  gesture: Exclude<GestureType, 'NONE'>;
  className?: string;
  fill?: string;
  outline?: string;
}

export const HandGlyph: React.FC<HandGlyphProps> = ({
  gesture,
  className = 'w-10 h-10',
  fill = '#FDFDFD',
  outline = '#0F0F0F',
}) => {
  const { parts, details } = SHAPES[gesture];

  const renderParts = (color: string, stroke?: number) =>
    parts.map((p, i) => (
      <rect
        key={i}
        x={p.x}
        y={p.y}
        width={p.w}
        height={p.h}
        rx={Math.min(p.w, p.h) / 2}
        transform={p.rot ? `rotate(${p.rot.join(' ')})` : undefined}
        fill={color}
        stroke={stroke ? color : undefined}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    ));

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <g>{renderParts(outline, 6)}</g>
      <g>{renderParts(fill)}</g>
      <g stroke={outline} strokeWidth={2.5} strokeLinecap="round" fill="none">
        {details.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
};
