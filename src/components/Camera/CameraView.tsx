import React from 'react';
import { FilterEngine } from '../../canvas/filterEngine';
import { GestureRingMeter } from './GestureRingMeter';
import { FilterType } from '../../types/photobooth';
import { GestureType, GestureState } from '../../types/gesture';
import { StarBurst } from '../UI/PersonaArt';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement>;
  isMirrored: boolean;
  activeFilter: FilterType;
  isLoading: boolean;
  isModelLoading: boolean;
  activeGesture: GestureType;
  gestureState: GestureState;
  holdProgress: number;
  cooldownRemaining: number;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  overlayCanvasRef,
  isMirrored,
  activeFilter,
  isLoading,
  isModelLoading,
  activeGesture,
  gestureState,
  holdProgress,
  cooldownRemaining,
}) => {
  const cssFilter = FilterEngine.getCSSFilter(activeFilter);

  return (
    <div className="relative w-full" style={{ transform: 'rotate(-1deg)' }}>
      {/* Offset red slab behind the frame */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 bg-p5-red border-[3px] border-p5-black" />

      <div className="relative w-full aspect-[4/3] md:aspect-[16/9] max-h-[68vh] overflow-hidden bg-p5-black border-[6px] border-p5-white outline outline-[3px] outline-p5-black">
        {/* Loading State */}
        {(isLoading || isModelLoading) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-p5-black">
            <StarBurst className="w-24 h-24 animate-spin" rings={6} colors={['#E5191C', '#FDFDFD']} />
            <span className="mt-6 p5-heading text-2xl">Loading</span>
          </div>
        )}

        {/* Live Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={{
            filter: cssFilter,
            transform: isMirrored ? 'scaleX(-1)' : 'none',
          }}
          className="w-full h-full object-cover transition-[filter] duration-300"
        />

        {/* Skeleton Overlay Canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        <GestureRingMeter
          gesture={activeGesture}
          state={gestureState}
          progress={holdProgress}
          cooldownRemaining={cooldownRemaining}
        />

        {/* LIVE tag */}
        <div
          className="absolute top-4 left-4 z-20 px-2.5 py-0.5 bg-p5-red text-p5-white font-display uppercase tracking-widest border-2 border-p5-black pointer-events-none"
          style={{ transform: 'rotate(-4deg) skewX(-10deg)' }}
        >
          Live
        </div>

        {/* Black corner slashes */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="100,78 100,100 82,100" fill="#E5191C" />
          <polygon points="100,86 100,100 90,100" fill="#0F0F0F" />
        </svg>
      </div>
    </div>
  );
};
