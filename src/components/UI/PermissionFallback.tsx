import React from 'react';
import { StarBurst, PERSONA_ASSETS } from './PersonaArt';
import { PersonaText } from '../../persona/personaTextEngine';

interface PermissionFallbackProps {
  error: string | null;
  onRetry: () => void;
  onUseDemoPhotos?: () => void;
}

export const PermissionFallback: React.FC<PermissionFallbackProps> = ({
  error,
  onRetry,
  onUseDemoPhotos,
}) => {
  return (
    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-10 items-center my-8">
      <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center">
        <StarBurst className="absolute inset-0 w-full h-full animate-p5-spin-slow" rings={10} colors={['#E5191C', '#0F0F0F']} />
        <img src={PERSONA_ASSETS.jokerHand} alt="" className="relative w-[115%] max-w-none" />
      </div>

      <div className="p5-card p-6 sm:p-8 flex flex-col gap-6" style={{ transform: 'rotate(1.5deg)' }}>
        <PersonaText text="No camera" size="xl" />

        <p className="font-semibold text-p5-white leading-relaxed">
          {error || 'Allow camera access to use the photobooth.'}
        </p>

        <ol className="space-y-2 text-sm text-p5-white">
          {[
            'Click the camera or lock icon in the address bar.',
            'Set Camera to Allow.',
            'Close other apps using the webcam.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-p5-red font-display border-2 border-p5-white" style={{ transform: 'rotate(-6deg)' }}>
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-4 pt-2">
          <button onClick={onRetry} className="p5-btn p5-btn-primary text-lg">
            <span>Try Again</span>
          </button>
          {onUseDemoPhotos && (
            <button onClick={onUseDemoPhotos} className="p5-btn text-lg">
              <span>Demo Photos</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
