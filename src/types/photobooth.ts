export type FilterType = 
  | 'normal' 
  | 'fallen-angels'
  | 'fallen-neon'
  | 'fallen-noir'
  | 'fallen-amber'
  | 'persona-crimson'
  | 'vintage' 
  | 'cyberpunk' 
  | 'grayscale';

export type StripLayout = 'vertical-1x4' | 'grid-2x2' | 'classic-2x1';

export type BorderStyle = 'solid' | 'rounded' | 'film-strip' | 'neon-glow';

export interface ThemePreset {
  id: string;
  name: string;
  bgGradient: string; // CSS or canvas gradient description
  bgColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
}

export interface StickerItem {
  id: string;
  label: string;
  emoji: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  xPercent: number; // 0 to 100 relative to strip width
  yPercent: number; // 0 to 100 relative to strip height
  scale: number;
  rotation: number; // degrees
  dataUrl?: string;
  vectorSvg?: string;
}

export type PhotoBoothStep = 
  | 'READY' 
  | 'COUNTDOWN' 
  | 'FLASH' 
  | 'PROCESSING' 
  | 'CUSTOMIZE' 
  | 'EXPORT';

export interface PhotoBoothSettings {
  totalShots: number; // 3 or 4
  countdownSeconds: number; // 3
  resolution: '720p' | '1080p';
  mirrored: boolean;
  gestureControlEnabled: boolean;
  soundEnabled: boolean;
}

export interface PhotoStripConfig {
  layout: StripLayout;
  theme: ThemePreset;
  borderStyle: BorderStyle;
  caption: string;
  dateText: string;
  stickers: PlacedSticker[];
  filter: FilterType;
}
