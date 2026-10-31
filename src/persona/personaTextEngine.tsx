import * as React from 'react';

export const P5_COLORS = {
  RED: '#E5191C',
  WHITE: '#FDFDFD',
  BLACK: '#0F0F0F',
  GOLD: '#FFEA00',
  DARK_RED: '#99000A',
};

export enum CHAR_MODE {
  FIRST = 1,
  WHITE = 2,
  RED = 3,
  SPACE = 4,
}

export interface CharSpec {
  char: string;
  mode: CHAR_MODE;
  angle: number;
  scale: number;
  bg: string;
  color: string;
  border: string;
}

/**
 * Computes deterministic or randomized character boxes based on LzxHahaha/persona5 algorithm
 */
export function getPersonaCharSpecs(text: string, forceSeed = true): CharSpec[] {
  if (!text) return [];

  const chars = text.toUpperCase().split('');
  const specs: CharSpec[] = [];

  const MAX_ANGLE = 9;

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (/^\s$/.test(char)) {
      specs.push({
        char: ' ',
        mode: CHAR_MODE.SPACE,
        angle: 0,
        scale: 1,
        bg: 'transparent',
        color: 'transparent',
        border: 'none',
      });
      continue;
    }

    // Determine mode: First char is accented; some random chars are highlighted in Red
    let mode = CHAR_MODE.WHITE;
    if (i === 0) {
      mode = CHAR_MODE.FIRST;
    } else {
      // Deterministic pseudo-random based on char code and index if forceSeed
      const hash = forceSeed
        ? (char.charCodeAt(0) * 17 + i * 31) % 10
        : Math.floor(Math.random() * 10);
      if (hash > 6 && i % 3 === 0) {
        mode = CHAR_MODE.RED;
      }
    }

    // Angle calculation from LzxHahaha/persona5:
    // angle = -(Math.round(Math.random() * 10) % MAX_ANGLE) * randomOp
    const baseAngle = forceSeed
      ? ((char.charCodeAt(0) * 13 + i * 7) % MAX_ANGLE)
      : Math.floor(Math.random() * MAX_ANGLE);
    const sign = (i % 2 === 0 ? 1 : -1);
    const angle = sign * (baseAngle + 2);

    let scale = 1.0;
    let bg = P5_COLORS.BLACK;
    let color = P5_COLORS.WHITE;
    let border = '1px solid rgba(255, 255, 255, 0.4)';

    if (mode === CHAR_MODE.FIRST) {
      scale = 1.15;
      bg = P5_COLORS.RED;
      color = P5_COLORS.WHITE;
      border = '2px solid #FFFFFF';
    } else if (mode === CHAR_MODE.RED) {
      scale = 0.95;
      bg = P5_COLORS.WHITE;
      color = P5_COLORS.RED;
      border = '1.5px solid #0F0F0F';
    } else {
      scale = 0.9 + ((i % 3) * 0.08);
      bg = P5_COLORS.BLACK;
      color = P5_COLORS.WHITE;
      border = '1.5px solid rgba(255, 255, 255, 0.35)';
    }

    specs.push({
      char,
      mode,
      angle,
      scale,
      bg,
      color,
      border,
    });
  }

  return specs;
}

/**
 * Canvas renderer for Persona 5 cutout box text (from LzxHahaha/persona5 BoxText)
 */
export function drawPersonaTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  options: {
    fontSize?: number;
    fontFamily?: string;
    gutter?: number;
    showContour?: boolean;
  } = {}
): void {
  const {
    fontSize = 32,
    fontFamily = "'Anton', 'Bebas Neue', 'Impact', sans-serif",
    gutter = 6,
    showContour = true,
  } = options;

  const specs = getPersonaCharSpecs(text, true);
  if (specs.length === 0) return;

  // Measure total width
  let totalW = 0;
  const measured: Array<{
    spec: CharSpec;
    w: number;
    h: number;
    boxW: number;
    boxH: number;
  }> = [];

  ctx.save();
  for (const spec of specs) {
    if (spec.mode === CHAR_MODE.SPACE) {
      const spaceW = fontSize * 0.4;
      measured.push({ spec, w: spaceW, h: fontSize, boxW: spaceW, boxH: fontSize });
      totalW += spaceW + gutter;
      continue;
    }

    const charFontSize = Math.round(fontSize * spec.scale);
    ctx.font = `bold ${charFontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(spec.char);
    const charW = Math.max(metrics.width, charFontSize * 0.55);
    const charH = charFontSize * 1.1;

    // Outer box padding
    const boxW = charW + charFontSize * 0.35;
    const boxH = charH + charFontSize * 0.25;

    measured.push({ spec, w: charW, h: charH, boxW, boxH });
    totalW += boxW + gutter;
  }
  ctx.restore();

  let curX = centerX - totalW / 2;

  // Draw background boxes and characters
  for (const m of measured) {
    const { spec, boxW, boxH } = m;
    if (spec.mode === CHAR_MODE.SPACE) {
      curX += m.w + gutter;
      continue;
    }

    const boxCenterX = curX + boxW / 2;
    const boxCenterY = centerY;

    ctx.save();
    ctx.translate(boxCenterX, boxCenterY);
    ctx.rotate((spec.angle * Math.PI) / 180);

    // 1. Drop shadow (Persona comic offset shadow)
    ctx.fillStyle = '#000000';
    ctx.fillRect(-boxW / 2 + 3, -boxH / 2 + 3, boxW, boxH);

    // 2. Main Box Background
    ctx.fillStyle = spec.bg;
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

    // 3. Crisp white contour stroke if specified
    if (showContour) {
      ctx.lineWidth = spec.mode === CHAR_MODE.FIRST ? 2.5 : 1.5;
      ctx.strokeStyle = spec.mode === CHAR_MODE.RED ? '#0F0F0F' : '#FFFFFF';
      ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
    }

    // 4. Character Text
    const charFontSize = Math.round(fontSize * spec.scale);
    ctx.font = `bold ${charFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = spec.color;
    ctx.fillText(spec.char, 0, 1);

    ctx.restore();

    curX += boxW + gutter;
  }
}

/**
 * Reusable React component that displays words using the LzxHahaha/persona5 cutout box art
 */
export const PersonaText: React.FC<{
  text: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  as?: 'div' | 'span' | 'h1' | 'h2' | 'h3';
}> = ({ text, size = 'md', className = '', as: Component = 'span' }) => {
  const specs = React.useMemo(() => getPersonaCharSpecs(text, true), [text]);

  const sizeClasses = {
    xs: 'text-xs px-1 py-0.5',
    sm: 'text-sm px-1.5 py-0.5',
    md: 'text-base px-2 py-1',
    lg: 'text-xl px-2.5 py-1',
    xl: 'text-2xl px-3 py-1.5',
    '2xl': 'text-3xl sm:text-4xl px-3.5 py-2',
  }[size];

  // Group letters into words so wrapping only happens between words
  const words = specs.reduce<{ spec: CharSpec; idx: number }[][]>(
    (acc, spec, idx) => {
      if (spec.mode === CHAR_MODE.SPACE) acc.push([]);
      else acc[acc.length - 1].push({ spec, idx });
      return acc;
    },
    [[]]
  );

  return (
    <Component className={`inline-flex items-center flex-wrap gap-x-3 gap-y-2 select-none ${className}`}>
      {words.filter((w) => w.length > 0).map((word, wIdx) => (
        <span key={wIdx} className="inline-flex items-center gap-1 whitespace-nowrap">
          {word.map(({ spec: s, idx }) => (
            <span
              key={idx}
              style={{
                transform: `rotate(${s.angle}deg) scale(${s.scale})`,
                backgroundColor: s.bg,
                color: s.color,
                border: s.border,
              }}
              className={`font-display tracking-tight leading-none inline-block shadow-[3px_3px_0px_#0F0F0F] cursor-default ${sizeClasses}`}
            >
              {s.char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
};
