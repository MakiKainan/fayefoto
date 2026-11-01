import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarkerManager } from '../vision/handLandmarkerManager';
import { classifyHandGesture } from '../vision/gestureClassifier';
import { GestureStateMachine } from '../vision/gestureStateMachine';
import { renderNeonSkeleton } from '../vision/neonSkeletalRenderer';
import { GestureType, GestureState } from '../types/gesture';

export interface UseHandTrackingOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled?: boolean;
  mirrored?: boolean;
  onGestureTrigger?: (gesture: GestureType) => void;
  holdThresholdMs?: number;
  cooldownDurationMs?: number;
  /** When set, only these gestures are recognised; everything else is ignored and not drawn */
  allowedGestures?: GestureType[];
}

export function useHandTracking({
  videoRef,
  enabled = true,
  mirrored = true,
  onGestureTrigger,
  holdThresholdMs = 500,
  cooldownDurationMs = 2000,
  allowedGestures,
}: UseHandTrackingOptions) {
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateMachineRef = useRef<GestureStateMachine>(
    new GestureStateMachine({ holdThresholdMs, cooldownDurationMs })
  );

  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);

  // Live Gesture States
  const [activeGesture, setActiveGesture] = useState<GestureType>('NONE');
  const [gestureState, setGestureState] = useState<GestureState>('IDLE');
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [handDetected, setHandDetected] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(0);

  const onTriggerRef = useRef(onGestureTrigger);
  onTriggerRef.current = onGestureTrigger;
  const allowedRef = useRef(allowedGestures);
  allowedRef.current = allowedGestures;
  const allowedKey = allowedGestures ? allowedGestures.join(',') : '*';

  const clearOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Switching gesture mode (e.g. capture starts): drop any leftover hold/cooldown and drawings
  useEffect(() => {
    stateMachineRef.current.reset();
    setActiveGesture('NONE');
    setGestureState('IDLE');
    setHoldProgress(0);
    setCooldownRemaining(0);
    clearOverlay();
  }, [allowedKey, clearOverlay]);

  // Initialize MediaPipe Vision Task
  useEffect(() => {
    let isMounted = true;
    const manager = HandLandmarkerManager.getInstance();

    async function loadModel() {
      setIsModelLoading(true);
      setModelError(null);
      try {
        await manager.initialize();
        if (isMounted) setIsModelLoading(false);
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Vision initialization error:', err);
          setModelError('Could not initialize MediaPipe vision task.');
          setIsModelLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update State Machine Config on prop change
  useEffect(() => {
    stateMachineRef.current.setConfig({
      holdThresholdMs,
      cooldownDurationMs,
    });
  }, [holdThresholdMs, cooldownDurationMs]);

  // Main Detection Loop
  useEffect(() => {
    if (!enabled || isModelLoading || modelError) return;

    let animationFrameId: number;
    let lastFpsUpdateTime = performance.now();
    let frameCounter = 0;

    const manager = HandLandmarkerManager.getInstance();
    const stateMachine = stateMachineRef.current;

    const runLoop = () => {
      const now = performance.now();
      const video = videoRef.current;
      const canvas = overlayCanvasRef.current;

      // Update FPS counter every 500ms
      frameCounter++;
      if (now - lastFpsUpdateTime >= 500) {
        setFps(Math.round((frameCounter * 1000) / (now - lastFpsUpdateTime)));
        frameCounter = 0;
        lastFpsUpdateTime = now;
      }

      if (video && video.readyState >= 2 && manager.isReady()) {
        // Sync overlay canvas dimensions with video
        if (canvas) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 1280;
            canvas.height = video.videoHeight || 720;
          }
        }

        // Run ML inference
        const { landmarks, skipped } = manager.detectHand(video);

        if (skipped) {
          // No new camera frame since last tick; keep current hold state
        } else if (landmarks && landmarks.length >= 21) {
          setHandDetected(true);

          // 1. Biometric Classification
          const classification = classifyHandGesture(landmarks);
          const allowed = allowedRef.current;
          if (allowed && !allowed.includes(classification.gesture)) {
            classification.gesture = 'NONE';
            classification.confidence = 0;
          }
          setConfidence(classification.confidence);

          // 2. Feed into Gesture State Machine
          const smResult = stateMachine.update(
            classification.gesture,
            classification.confidence,
            now
          );

          setActiveGesture(smResult.activeGesture);
          setGestureState(smResult.state);
          setHoldProgress(smResult.holdProgress);
          setCooldownRemaining(smResult.cooldownRemaining);

          // 3. Render Neon Skeleton
          if (canvas && allowed && smResult.activeGesture === 'NONE') {
            canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          } else if (canvas) {
            renderNeonSkeleton({
              canvas,
              landmarks,
              activeGesture: smResult.activeGesture,
              holdProgress: smResult.holdProgress,
              mirrored,
            });
          }

          // 4. Trigger Callback if held threshold passed
          if (smResult.triggered && smResult.activeGesture !== 'NONE') {
            onTriggerRef.current?.(smResult.activeGesture);
          }
        } else {
          // Hand not in view
          setHandDetected(false);
          const smResult = stateMachine.update('NONE', 0, now);
          setActiveGesture('NONE');
          setGestureState(smResult.state);
          setHoldProgress(0);
          setCooldownRemaining(smResult.cooldownRemaining);

          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }

      animationFrameId = requestAnimationFrame(runLoop);
    };

    animationFrameId = requestAnimationFrame(runLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearOverlay();
    };
  }, [enabled, isModelLoading, modelError, videoRef, mirrored, clearOverlay]);

  const resetStateMachine = useCallback(() => {
    stateMachineRef.current.reset();
    setActiveGesture('NONE');
    setGestureState('IDLE');
    setHoldProgress(0);
    setCooldownRemaining(0);
  }, []);

  return {
    overlayCanvasRef,
    isModelLoading,
    modelError,
    activeGesture,
    gestureState,
    holdProgress,
    cooldownRemaining,
    confidence,
    handDetected,
    fps,
    resetStateMachine,
  };
}
