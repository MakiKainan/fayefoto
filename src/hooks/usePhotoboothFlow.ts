import { useState, useCallback, useRef } from 'react';
import {
  PhotoBoothStep,
  FilterType,
  StripLayout,
  ThemePreset,
  PlacedSticker,
  PhotoStripConfig,
} from '../types/photobooth';
import { GestureType } from '../types/gesture';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'persona-crimson',
    name: 'Phantom Red',
    bgGradient: 'linear-gradient(160deg, #0F0F0F 0 55%, #E5191C 55% 100%)',
    bgColor: '#0F0F0F',
    textColor: '#FDFDFD',
    accentColor: '#E5191C',
    borderColor: '#FDFDFD',
  },
  {
    id: 'calling-card',
    name: 'Calling Card',
    bgGradient: 'repeating-linear-gradient(-55deg, #E5191C 0 6px, #0F0F0F 6px 9px)',
    bgColor: '#E5191C',
    textColor: '#FDFDFD',
    accentColor: '#0F0F0F',
    borderColor: '#0F0F0F',
  },
  {
    id: 'shibuya-white',
    name: 'Shibuya White',
    bgGradient: 'linear-gradient(160deg, #FDFDFD 0 60%, #0F0F0F 60% 100%)',
    bgColor: '#FDFDFD',
    textColor: '#FDFDFD',
    accentColor: '#E5191C',
    borderColor: '#0F0F0F',
  },
  {
    id: 'fallen-angels',
    name: 'Fallen Angels',
    bgGradient: 'linear-gradient(135deg, #021207, #062614, #004d2b, #011408)',
    bgColor: '#031207',
    textColor: '#E6FFF2',
    accentColor: '#00e676',
    borderColor: '#00e676',
  },
  {
    id: 'midnight',
    name: 'Midnight Black',
    bgGradient: '#0F0F0F',
    bgColor: '#0F0F0F',
    textColor: '#FDFDFD',
    accentColor: '#E5191C',
    borderColor: '#E5191C',
  },
  {
    id: 'pastel-pink',
    name: 'Pastel Dream',
    bgGradient: '#FCE7F3',
    bgColor: '#FDF2F8',
    textColor: '#831843',
    accentColor: '#EC4899',
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    id: 'retro-cream',
    name: 'Vintage Cream',
    bgGradient: '#FEF3C7',
    bgColor: '#FFFBEB',
    textColor: '#78350F',
    accentColor: '#D97706',
    borderColor: 'rgba(180, 83, 9, 0.3)',
  },
];

const FILTER_ORDER: FilterType[] = [
  'normal',
  'fallen-angels',
  'fallen-neon',
  'fallen-noir',
  'fallen-amber',
  'persona-crimson',
  'vintage',
  'cyberpunk',
  'grayscale',
];

const LAYOUT_ORDER: StripLayout[] = [
  'vertical-1x4',
  'grid-2x2',
  'classic-2x1',
];

export interface UsePhotoboothFlowOptions {
  onCaptureFrame: () => string | null;
  playCountdownBeep: (pitch?: number) => void;
  playShutterSound: () => void;
  playGestureChime: () => void;
}

export function usePhotoboothFlow({
  onCaptureFrame,
  playCountdownBeep,
  playShutterSound,
  playGestureChime,
}: UsePhotoboothFlowOptions) {
  const [step, setStep] = useState<PhotoBoothStep>('READY');
  const [photos, setPhotos] = useState<string[]>([]);
  const [totalShots, setTotalShots] = useState<number>(4);
  const [countdownValue, setCountdownValue] = useState<number>(0);
  const [currentShotNumber, setCurrentShotNumber] = useState<number>(1);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

  // Customization Options
  const [activeFilter, setActiveFilter] = useState<FilterType>('normal');
  const [activeLayout, setActiveLayout] = useState<StripLayout>('vertical-1x4');
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(THEME_PRESETS[0]);
  const [caption, setCaption] = useState<string>('FAYEFOTO');
  const [dateText, setDateText] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).toUpperCase();
  });
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [borderStyle, setBorderStyle] = useState<PhotoStripConfig['borderStyle']>('neon-glow');

  const isCapturingRef = useRef<boolean>(false);

  /**
   * Internal sequence runner for multi-shot capture
   */
  const startCaptureSequence = useCallback(async () => {
    if (isCapturingRef.current) return;
    isCapturingRef.current = true;
    setPhotos([]);
    setStep('COUNTDOWN');

    const capturedPhotos: string[] = [];

    for (let shot = 1; shot <= totalShots; shot++) {
      setCurrentShotNumber(shot);

      // 3-second countdown
      for (let c = 3; c > 0; c--) {
        setCountdownValue(c);
        playCountdownBeep(c === 1 ? 880 : 520);
        await new Promise((res) => setTimeout(res, 900));
      }

      // Flash & Capture
      setIsFlashActive(true);
      playShutterSound();

      const frameData = onCaptureFrame();
      if (frameData) {
        capturedPhotos.push(frameData);
        setPhotos([...capturedPhotos]);
      }

      await new Promise((res) => setTimeout(res, 350));
      setIsFlashActive(false);

      // Brief pause between shots if not the final shot
      if (shot < totalShots) {
        setStep('PROCESSING');
        await new Promise((res) => setTimeout(res, 800));
        setStep('COUNTDOWN');
      }
    }

    isCapturingRef.current = false;
    setCountdownValue(0);
    setStep('CUSTOMIZE');
  }, [totalShots, playCountdownBeep, playShutterSound, onCaptureFrame]);

  // Gesture Dispatcher
  const handleGestureAction = useCallback(
    (gesture: GestureType) => {
      playGestureChime();

      switch (gesture) {
        case 'VICTORY':
          // Peace sign starts capture countdown if on READY screen
          if (step === 'READY') {
            startCaptureSequence();
          }
          break;

        case 'THUMBS_UP':
          // Thumbs up cycles layout
          setActiveLayout((prev) => {
            const nextIdx = (LAYOUT_ORDER.indexOf(prev) + 1) % LAYOUT_ORDER.length;
            return LAYOUT_ORDER[nextIdx];
          });
          break;

        case 'OPEN_PALM':
          // Open palm cycles live filter
          setActiveFilter((prev) => {
            const nextIdx = (FILTER_ORDER.indexOf(prev) + 1) % FILTER_ORDER.length;
            return FILTER_ORDER[nextIdx];
          });
          break;

        case 'FIST':
          // Fist resets current session or retakes photos
          setPhotos([]);
          setCountdownValue(0);
          setStep('READY');
          break;
      }
    },
    [step, startCaptureSequence, playGestureChime]
  );

  const resetSession = useCallback(() => {
    isCapturingRef.current = false;
    setCountdownValue(0);
    setPhotos([]);
    setStickers([]);
    setStep('READY');
  }, []);

  const loadPhotos = useCallback((newPhotos: string[]) => {
    isCapturingRef.current = false;
    setCountdownValue(0);
    setPhotos(newPhotos);
    setStep('CUSTOMIZE');
  }, []);

  const addSticker = useCallback((emoji: string, stickerId: string, dataUrl?: string, vectorSvg?: string) => {
    const newSticker: PlacedSticker = {
      id: Math.random().toString(36).substring(2, 9),
      stickerId,
      emoji,
      xPercent: 20 + Math.random() * 60,
      yPercent: 20 + Math.random() * 60,
      scale: 1,
      rotation: Math.round((Math.random() - 0.5) * 40),
      dataUrl,
      vectorSvg,
    };
    setStickers((prev) => [...prev, newSticker]);
  }, []);

  const removeSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const stripConfig: PhotoStripConfig = {
    layout: activeLayout,
    theme: activeTheme,
    borderStyle,
    caption,
    dateText,
    stickers,
    filter: activeFilter,
  };

  return {
    step,
    setStep,
    photos,
    totalShots,
    setTotalShots,
    countdownValue,
    currentShotNumber,
    isFlashActive,
    activeFilter,
    setActiveFilter,
    activeLayout,
    setActiveLayout,
    activeTheme,
    setActiveTheme,
    caption,
    setCaption,
    dateText,
    setDateText,
    stickers,
    borderStyle,
    setBorderStyle,
    stripConfig,
    startCaptureSequence,
    handleGestureAction,
    resetSession,
    loadPhotos,
    addSticker,
    removeSticker,
  };
}
