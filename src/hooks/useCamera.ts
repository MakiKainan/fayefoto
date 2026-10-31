import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCameraOptions {
  resolution?: '720p' | '1080p';
  mirrored?: boolean;
}

export function useCamera({
  resolution = '720p',
  mirrored = true,
}: UseCameraOptions = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestIdRef = useRef<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [currentResolution, setCurrentResolution] = useState<'720p' | '1080p'>(resolution);
  const [isMirrored, setIsMirrored] = useState<boolean>(mirrored);

  const getConstraints = useCallback((res: '720p' | '1080p'): MediaStreamConstraints => {
    const is1080 = res === '1080p';
    return {
      audio: false,
      video: {
        width: { ideal: is1080 ? 1920 : 1280 },
        height: { ideal: is1080 ? 1080 : 720 },
        facingMode: 'user',
        frameRate: { ideal: 60, min: 30 },
      },
    };
  }, []);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startStream = useCallback(
    async (res: '720p' | '1080p') => {
      const requestId = ++requestIdRef.current;
      setIsLoading(true);
      setError(null);
      stopStream();

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API is not supported in this browser environment.');
        }

        const constraints = getConstraints(res);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // A newer request (resolution switch, StrictMode remount) superseded this one
        if (requestId !== requestIdRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            // play() is interrupted when the element is re-sourced; autoPlay recovers it
            if (!(playErr instanceof DOMException && playErr.name === 'AbortError')) throw playErr;
          }
        }

        setPermissionGranted(true);
      } catch (err: unknown) {
        if (requestId !== requestIdRef.current) return;
        let msg = 'Failed to access camera.';
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = 'Camera permission was denied. Please allow camera access in your browser settings.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            msg = 'No camera device detected. Please connect a webcam.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            msg = 'Webcam is currently in use by another application.';
          }
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setError(msg);
        setPermissionGranted(false);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    },
    [getConstraints, stopStream]
  );

  useEffect(() => {
    startStream(currentResolution);
    return () => {
      requestIdRef.current++;
      stopStream();
    };
  }, [startStream, currentResolution, stopStream]);

  // The <video> element unmounts while customizing; re-attach the live stream when it comes back
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
  });

  const switchResolution = useCallback((newRes: '720p' | '1080p') => {
    setCurrentResolution(newRes);
  }, []);

  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);

  /**
   * Captures the current video frame at full native resolution as base64 JPEG
   */
  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (isMirrored) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, [isMirrored]);

  return {
    videoRef,
    isLoading,
    error,
    permissionGranted,
    currentResolution,
    isMirrored,
    switchResolution,
    toggleMirror,
    captureFrame,
    retry: () => startStream(currentResolution),
  };
}
