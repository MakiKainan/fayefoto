import React from 'react';
import { FlipHorizontal, Volume2, VolumeX, Hand } from 'lucide-react';

interface CameraControlsProps {
  resolution: '720p' | '1080p';
  onResolutionChange: (res: '720p' | '1080p') => void;
  isMirrored: boolean;
  onToggleMirror: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  gestureEnabled: boolean;
  onToggleGesture: () => void;
  onManualCapture?: () => void;
  canCapture: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  resolution,
  onResolutionChange,
  isMirrored,
  onToggleMirror,
  soundEnabled,
  onToggleSound,
  gestureEnabled,
  onToggleGesture,
  onManualCapture,
  canCapture,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggleMirror}
          title={isMirrored ? 'Mirror on' : 'Mirror off'}
          data-active={isMirrored}
          className="p5-btn px-3"
        >
          <FlipHorizontal className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <button
          onClick={() => onResolutionChange(resolution === '720p' ? '1080p' : '720p')}
          title="Resolution"
          className="p5-btn"
        >
          <span>{resolution}</span>
        </button>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute' : 'Unmute'}
          data-active={soundEnabled}
          className="p5-btn px-3"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" strokeWidth={2.5} /> : <VolumeX className="w-5 h-5" strokeWidth={2.5} />}
        </button>

        <button
          onClick={onToggleGesture}
          title="Gesture control"
          data-active={gestureEnabled}
          className="p5-btn"
        >
          <span className="flex items-center gap-2">
            <Hand className="w-4 h-4" strokeWidth={2.5} />
            Gestures {gestureEnabled ? 'On' : 'Off'}
          </span>
        </button>
      </div>

      {canCapture && onManualCapture && (
        <button onClick={onManualCapture} className="p5-btn p5-btn-primary text-2xl px-8 py-2.5">
          <span>Take Photos</span>
        </button>
      )}
    </div>
  );
};
