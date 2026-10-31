import React, { useEffect, useRef } from 'react';
import { PhotoStripRenderer } from '../../canvas/photoStripRenderer';
import { PhotoStripConfig } from '../../types/photobooth';
import { StarBurst } from '../UI/PersonaArt';

interface StripPreviewProps {
  photos: string[];
  config: PhotoStripConfig;
}

export const StripPreview: React.FC<StripPreviewProps> = ({ photos, config }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || photos.length === 0) return;

    PhotoStripRenderer.renderToCanvas(canvas, {
      photos,
      config,
      exportScale: 1.0, // 1x scale for live responsive UI preview
    }).catch((err) => {
      if (!isCancelled) {
        console.error('Error rendering preview strip:', err);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [photos, config]);

  return (
    <div className="relative flex items-center justify-center w-full py-8">
      <StarBurst className="absolute w-[min(90%,520px)] aspect-square animate-p5-spin-slow" />
      <div className="relative" style={{ transform: 'rotate(-3deg)' }}>
        <canvas
          ref={canvasRef}
          className="block max-h-[72vh] w-auto max-w-full border-[5px] border-p5-white outline outline-[3px] outline-p5-black shadow-[12px_12px_0_#E5191C]"
        />
      </div>
    </div>
  );
};
