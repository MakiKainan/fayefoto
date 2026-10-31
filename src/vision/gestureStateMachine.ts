import { GestureType, GestureState, GestureConfig } from '../types/gesture';

export interface StateMachineUpdateResult {
  state: GestureState;
  activeGesture: GestureType;
  holdProgress: number; // 0.0 to 1.0
  cooldownRemaining: number; // ms remaining
  triggered: boolean;
}

export class GestureStateMachine {
  private config: GestureConfig;
  private currentState: GestureState = 'IDLE';
  private currentCandidateGesture: GestureType = 'NONE';
  private gestureStartTime: number = 0;
  private cooldownStartTime: number = 0;

  constructor(config?: Partial<GestureConfig>) {
    this.config = {
      holdThresholdMs: config?.holdThresholdMs ?? 550, // 550ms hold
      cooldownDurationMs: config?.cooldownDurationMs ?? 2000, // 2000ms cooldown
      minDetectionConfidence: config?.minDetectionConfidence ?? 0.65,
    };
  }

  public update(detectedGesture: GestureType, confidence: number, now: number = performance.now()): StateMachineUpdateResult {
    // 1. Handle COOLDOWN state
    if (this.currentState === 'COOLDOWN') {
      const elapsedCooldown = now - this.cooldownStartTime;
      const cooldownRemaining = Math.max(0, this.config.cooldownDurationMs - elapsedCooldown);

      if (cooldownRemaining === 0) {
        this.currentState = 'IDLE';
        this.currentCandidateGesture = 'NONE';
        this.gestureStartTime = 0;
      } else {
        return {
          state: 'COOLDOWN',
          activeGesture: this.currentCandidateGesture,
          holdProgress: 0,
          cooldownRemaining,
          triggered: false,
        };
      }
    }

    // 2. Validate gesture signal
    const isValidGesture = detectedGesture !== 'NONE' && confidence >= this.config.minDetectionConfidence;

    if (!isValidGesture) {
      // Lost gesture or confidence dropped -> reset hold
      this.currentState = 'IDLE';
      this.currentCandidateGesture = 'NONE';
      this.gestureStartTime = 0;

      return {
        state: 'IDLE',
        activeGesture: 'NONE',
        holdProgress: 0,
        cooldownRemaining: 0,
        triggered: false,
      };
    }

    // 3. New gesture detected or changed gesture
    if (this.currentCandidateGesture !== detectedGesture) {
      this.currentCandidateGesture = detectedGesture;
      this.gestureStartTime = now;
      this.currentState = 'HOLDING';

      return {
        state: 'HOLDING',
        activeGesture: detectedGesture,
        holdProgress: 0,
        cooldownRemaining: 0,
        triggered: false,
      };
    }

    // 4. Same gesture being held
    const elapsedHold = now - this.gestureStartTime;
    const holdProgress = Math.min(1.0, elapsedHold / this.config.holdThresholdMs);

    if (holdProgress >= 1.0) {
      // Reached trigger threshold!
      this.currentState = 'COOLDOWN';
      this.cooldownStartTime = now;

      return {
        state: 'TRIGGERED',
        activeGesture: detectedGesture,
        holdProgress: 1.0,
        cooldownRemaining: this.config.cooldownDurationMs,
        triggered: true,
      };
    }

    // Still holding
    this.currentState = 'HOLDING';
    return {
      state: 'HOLDING',
      activeGesture: detectedGesture,
      holdProgress,
      cooldownRemaining: 0,
      triggered: false,
    };
  }

  public reset(): void {
    this.currentState = 'IDLE';
    this.currentCandidateGesture = 'NONE';
    this.gestureStartTime = 0;
    this.cooldownStartTime = 0;
  }

  public setConfig(config: Partial<GestureConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
