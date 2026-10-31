export type GestureType = 'NONE' | 'VICTORY' | 'THUMBS_UP' | 'OPEN_PALM' | 'FIST';

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export type HandLandmarks = Landmark3D[];

export type GestureState = 'IDLE' | 'HOLDING' | 'TRIGGERED' | 'COOLDOWN';

export interface GestureDetectionResult {
  gesture: GestureType;
  confidence: number;
  holdProgress: number; // 0.0 to 1.0 (reaches 1.0 at 500ms)
  cooldownRemaining: number; // ms remaining in cooldown
  state: GestureState;
  landmarks: HandLandmarks | null;
  handedness: 'Left' | 'Right' | 'Unknown';
  fps: number;
  lowLightWarning: boolean;
  handDetected: boolean;
}

export interface GestureConfig {
  holdThresholdMs: number; // Duration to hold gesture before triggering (e.g., 500ms)
  cooldownDurationMs: number; // Cooldown after a trigger before next gesture (e.g., 2000ms)
  minDetectionConfidence: number; // Confidence threshold
}

export interface GestureEvent {
  gesture: GestureType;
  timestamp: number;
}
