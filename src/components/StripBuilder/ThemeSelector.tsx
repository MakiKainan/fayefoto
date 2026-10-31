import React from 'react';
import { ThemePreset } from '../../types/photobooth';
import { THEME_PRESETS } from '../../hooks/usePhotoboothFlow';

interface ThemeSelectorProps {
  activeTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ activeTheme, onSelectTheme }) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {THEME_PRESETS.map((preset, i) => {
        const isSelected = activeTheme.id === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onSelectTheme(preset)}
            title={preset.name}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`w-full aspect-square border-[3px] transition-transform duration-150 ${
                isSelected
                  ? 'border-p5-white shadow-[5px_5px_0_#E5191C]'
                  : 'border-p5-white shadow-[3px_3px_0_#0F0F0F] group-hover:-translate-y-1'
              }`}
              style={{
                background: preset.bgGradient,
                transform: `rotate(${i % 2 === 0 ? -4 : 3}deg)${isSelected ? ' scale(1.08)' : ''}`,
              }}
            />
            <span
              className={`font-display uppercase text-[11px] leading-tight tracking-wide text-center ${
                isSelected ? 'bg-p5-red text-p5-white px-1' : 'text-p5-white'
              }`}
            >
              {preset.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
