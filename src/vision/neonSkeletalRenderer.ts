import { HandLandmarks, GestureType } from '../types/gesture';

const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17]
];

export interface RenderNeonSkeletonOptions {
  canvas: HTMLCanvasElement;
  landmarks: HandLandmarks;
  activeGesture: GestureType;
  holdProgress: number;
  mirrored?: boolean;
}

export function renderNeonSkeleton({
  canvas,
  landmarks,
  activeGesture,
  holdProgress,
  mirrored = true
}: RenderNeonSkeletonOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || !landmarks || landmarks.length < 21) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Flat Persona 5 palette: no glow, hard outlines
  const RED = '#E5191C';
  const BLACK = '#0F0F0F';
  const WHITE = '#FDFDFD';
  const isHolding = activeGesture !== 'NONE';

  // Convert normalized [0,1] coordinates to screen pixels
  const points = landmarks.map(lm => ({
    x: mirrored ? (1 - lm.x) * width : lm.x * width,
    y: lm.y * height,
    z: lm.z
  }));

  const traceBones = () => {
    ctx.beginPath();
    for (const [start, end] of HAND_CONNECTIONS) {
      ctx.moveTo(points[start].x, points[start].y);
      ctx.lineTo(points[end].x, points[end].y);
    }
  };

  // 1. Bones: thick black outline pass, then flat fill pass
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  traceBones();
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 11;
  ctx.stroke();
  traceBones();
  ctx.strokeStyle = isHolding ? RED : WHITE;
  ctx.lineWidth = 5;
  ctx.stroke();

  // 2. Joints: square knuckles, fingertips as rotated diamonds
  points.forEach((pt, index) => {
    const isTip = [4, 8, 12, 16, 20].includes(index);
    const size = isTip ? 9 + holdProgress * 5 : 5;

    ctx.save();
    ctx.translate(pt.x, pt.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = isTip ? (isHolding ? WHITE : RED) : BLACK;
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  });

  // 3. Skewed gesture tag above the palm
  if (isHolding) {
    const palmCenter = {
      x: (points[0].x + points[5].x + points[17].x) / 3,
      y: (points[0].y + points[5].y + points[17].y) / 3,
    };

    ctx.save();
    ctx.font = '22px Anton, Impact, sans-serif';
    const text = activeGesture.replace('_', ' ');
    const textWidth = ctx.measureText(text).width;
    const tagW = textWidth + 28;
    const tagH = 34;

    ctx.translate(palmCenter.x, palmCenter.y - 70);
    ctx.rotate(-0.06);
    ctx.transform(1, 0, -0.2, 1, 0, 0);

    ctx.fillStyle = RED;
    ctx.fillRect(-tagW / 2 + 5, -tagH / 2 + 5, tagW, tagH);
    ctx.fillStyle = BLACK;
    ctx.fillRect(-tagW / 2, -tagH / 2, tagW, tagH);
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 3;
    ctx.strokeRect(-tagW / 2, -tagH / 2, tagW, tagH);

    ctx.fillStyle = WHITE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 1);
    ctx.restore();
  }

  ctx.restore();
}
