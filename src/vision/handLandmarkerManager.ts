import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandLandmarks } from '../types/gesture';

export class HandLandmarkerManager {
  private static instance: HandLandmarkerManager | null = null;
  private landmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  private lastVideoTime: number = -1;
  private isProcessingFrame: boolean = false;

  private constructor() {}

  public static getInstance(): HandLandmarkerManager {
    if (!HandLandmarkerManager.instance) {
      HandLandmarkerManager.instance = new HandLandmarkerManager();
    }
    return HandLandmarkerManager.instance;
  }

  public get isBusy(): boolean {
    return this.isInitializing;
  }

  public async initialize(): Promise<void> {
    if (this.landmarker) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
        );

        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.6,
          minHandPresenceConfidence: 0.6,
          minTrackingConfidence: 0.6,
        });
      } catch (err) {
        console.warn('GPU delegate failed or CDN error, attempting fallback to CPU:', err);
        try {
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
          );
          this.landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
          });
        } catch (fallbackErr) {
          console.error('Failed to initialize HandLandmarker:', fallbackErr);
          throw fallbackErr;
        }
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  public isReady(): boolean {
    return this.landmarker !== null;
  }

  /**
   * Performs real-time inference on HTMLVideoElement.
   * Uses frame skipping to guarantee 60 FPS UI rendering without main-thread blocking.
   */
  public detectHand(video: HTMLVideoElement): {
    landmarks: HandLandmarks | null;
    handedness: 'Left' | 'Right' | 'Unknown';
    lowLight: boolean;
    skipped: boolean;
  } {
    if (!this.landmarker || video.readyState < 2 || this.isProcessingFrame) {
      return { landmarks: null, handedness: 'Unknown', lowLight: false, skipped: true };
    }

    // Skip if frame has not updated (caller must not treat this as "hand lost")
    if (video.currentTime === this.lastVideoTime) {
      return { landmarks: null, handedness: 'Unknown', lowLight: false, skipped: true };
    }

    this.isProcessingFrame = true;
    this.lastVideoTime = video.currentTime;

    try {
      const startTimeMs = performance.now();
      const results = this.landmarker.detectForVideo(video, startTimeMs);

      let landmarks: HandLandmarks | null = null;
      let handedness: 'Left' | 'Right' | 'Unknown' = 'Unknown';

      if (results.landmarks && results.landmarks.length > 0) {
        landmarks = results.landmarks[0] as HandLandmarks;
        if (results.handedness && results.handedness.length > 0) {
          const categoryName = results.handedness[0][0]?.categoryName;
          handedness = categoryName === 'Left' ? 'Left' : 'Right';
        }
      }

      return {
        landmarks,
        handedness,
        lowLight: false,
        skipped: false,
      };
    } catch (e) {
      console.warn('Inference error:', e);
      return { landmarks: null, handedness: 'Unknown', lowLight: false, skipped: true };
    } finally {
      this.isProcessingFrame = false;
    }
  }

  public dispose(): void {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.initPromise = null;
  }
}
