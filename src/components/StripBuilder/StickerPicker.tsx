import React from 'react';
import { PlacedSticker } from '../../types/photobooth';
import { PERSONA_VECTOR_ASSETS, PersonaVectorAsset } from '../../assets/personaVectors';
import { X } from 'lucide-react';

interface StickerPickerProps {
  stickers: PlacedSticker[];
  onAddSticker: (emoji: string, stickerId: string, dataUrl?: string, vectorSvg?: string) => void;
  onRemoveSticker: (id: string) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  stickers,
  onAddSticker,
  onRemoveSticker,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
        {PERSONA_VECTOR_ASSETS.map((asset: PersonaVectorAsset, i) => (
          <button
            key={asset.id}
            onClick={() => onAddSticker(asset.name, asset.id, asset.dataUrl, asset.svg)}
            title={asset.name}
            className="group aspect-square p-2 bg-p5-white border-[3px] border-p5-black shadow-[4px_4px_0_#E5191C] hover:shadow-[6px_6px_0_#0F0F0F] hover:bg-p5-red transition-transform duration-100 active:translate-x-1 active:translate-y-1 flex items-center justify-center"
            style={{ transform: `rotate(${[-3, 2, -1, 4, -2][i % 5]}deg)` }}
          >
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
              dangerouslySetInnerHTML={{ __html: asset.svg }}
            />
          </button>
        ))}
      </div>

      {stickers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {stickers.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 bg-p5-black border-2 border-p5-white text-p5-white"
              style={{ transform: 'skewX(-10deg)' }}
            >
              {s.dataUrl && <img src={s.dataUrl} alt="" className="w-5 h-5 object-contain" />}
              <span className="font-display uppercase text-xs tracking-wide">{s.emoji}</span>
              <button
                onClick={() => onRemoveSticker(s.id)}
                title="Remove"
                className="text-p5-white hover:text-p5-red"
              >
                <X className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
