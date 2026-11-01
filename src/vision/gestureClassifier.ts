import { HandLandmarks, GestureType } from '../types/gesture';

/**
 * Geometric Vector & 3D Distance helpers
 */
function distance3D(
  p1: { x: number; y: number; z: number },
  p2: { x: number; y: number; z: number }
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export interface FingerStates {
  thumbExtended: boolean;
  indexExtended: boolean;
  middleExtended: boolean;
  ringExtended: boolean;
  pinkyExtended: boolean;
  thumbCurled: boolean;
  indexCurled: boolean;
  middleCurled: boolean;
  ringCurled: boolean;
  pinkyCurled: boolean;
}

export interface ClassificationResult {
  gesture: GestureType;
  confidence: number;
  fingerStates: FingerStates;
}

/**
 * Evaluates hand landmarks to classify gestures using scale-invariant biometric heuristics.
 * MediaPipe Hand Landmark indices:
 * 0: Wrist
 * 1-4: Thumb (CMC, MCP, IP, TIP)
 * 5-8: Index (MCP, PIP, DIP, TIP)
 * 9-12: Middle (MCP, PIP, DIP, TIP)
 * 13-16: Ring (MCP, PIP, DIP, TIP)
 * 17-20: Pinky (MCP, PIP, DIP, TIP)
 */
export function classifyHandGesture(landmarks: HandLandmarks): ClassificationResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      gesture: 'NONE',
      confidence: 0,
      fingerStates: {
        thumbExtended: false,
        indexExtended: false,
        middleExtended: false,
        ringExtended: false,
        pinkyExtended: false,
        thumbCurled: true,
        indexCurled: true,
        middleCurled: true,
        ringCurled: true,
        pinkyCurled: true,
      },
    };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];

  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];

  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];

  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];

  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];

  // Palm reference scale (wrist to middle MCP distance)
  const palmScale = distance3D(wrist, middleMcp);
  const safeScale = Math.max(palmScale, 0.001);

  // Helper: check if a standard finger (Index, Middle, Ring, Pinky) is extended or curled
  const isExtended = (tip: typeof wrist, pip: typeof wrist, mcp: typeof wrist): boolean => {
    const tipToWrist = distance3D(tip, wrist);
    const pipToWrist = distance3D(pip, wrist);
    const mcpToWrist = distance3D(mcp, wrist);
    return tipToWrist > pipToWrist && pipToWrist > mcpToWrist && tipToWrist > safeScale * 1.25;
  };

  const isCurled = (tip: typeof wrist, mcp: typeof wrist, _pip?: typeof wrist): boolean => {
    const tipToWrist = distance3D(tip, wrist);
    const mcpToWrist = distance3D(mcp, wrist);
    const tipToMcp = distance3D(tip, mcp);
    return tipToWrist < mcpToWrist * 1.2 || tipToMcp < safeScale * 0.55;
  };

  const indexExtended = isExtended(indexTip, indexPip, indexMcp);
  const indexCurled = isCurled(indexTip, indexMcp, indexPip);

  const middleExtended = isExtended(middleTip, middlePip, middleMcp);
  const middleCurled = isCurled(middleTip, middleMcp, middlePip);

  const ringExtended = isExtended(ringTip, ringPip, ringMcp);
  const ringCurled = isCurled(ringTip, ringMcp, ringPip);

  const pinkyExtended = isExtended(pinkyTip, pinkyPip, pinkyMcp);
  const pinkyCurled = isCurled(pinkyTip, pinkyMcp, pinkyPip);

  // Thumb analysis:
  // Thumb extension measured from Pinky MCP and Thumb MCP
  const thumbToPinkyMcp = distance3D(thumbTip, pinkyMcp);
  const thumbIpToPinkyMcp = distance3D(thumbIp, pinkyMcp);
  const thumbExtended = thumbToPinkyMcp > thumbIpToPinkyMcp && distance3D(thumbTip, thumbMcp) > safeScale * 0.65;
  const thumbCurled = distance3D(thumbTip, indexMcp) < safeScale * 0.6 || distance3D(thumbTip, pinkyMcp) < safeScale * 0.8;

  const fingerStates: FingerStates = {
    thumbExtended,
    indexExtended,
    middleExtended,
    ringExtended,
    pinkyExtended,
    thumbCurled,
    indexCurled,
    middleCurled,
    ringCurled,
    pinkyCurled,
  };

  // 1. VICTORY / PEACE: Index + Middle extended, Ring + Pinky curled tight
  if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
    const spreadDistance = distance3D(indexTip, middleTip) / safeScale;
    const confidence = Math.min(1.0, 0.75 + Math.min(spreadDistance * 0.25, 0.25));
    return { gesture: 'VICTORY', confidence, fingerStates };
  }

  // 3. OPEN PALM: All 5 fingers extended and spread outwards
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
    // Check spread between adjacent tips
    const d1 = distance3D(thumbTip, indexTip) / safeScale;
    const d2 = distance3D(indexTip, middleTip) / safeScale;
    const d3 = distance3D(middleTip, ringTip) / safeScale;
    const d4 = distance3D(ringTip, pinkyTip) / safeScale;
    const avgSpread = (d1 + d2 + d3 + d4) / 4;
    const confidence = Math.min(1.0, 0.65 + Math.min(avgSpread * 0.35, 0.35));
    return { gesture: 'OPEN_PALM', confidence, fingerStates };
  }

  // 4. FIST: All 4 main fingers curled tight, thumb folded against fingers
  if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
    const avgTipToWrist = (
      distance3D(indexTip, wrist) +
      distance3D(middleTip, wrist) +
      distance3D(ringTip, wrist) +
      distance3D(pinkyTip, wrist)
    ) / 4 / safeScale;

    if (avgTipToWrist < 1.3) {
      const confidence = Math.min(1.0, 0.8 + (1.3 - avgTipToWrist) * 0.2);
      return { gesture: 'FIST', confidence, fingerStates };
    }
  }

  return { gesture: 'NONE', confidence: 0, fingerStates };
}
