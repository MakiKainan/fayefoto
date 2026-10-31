import React from 'react';
import {
  StripLayout,
  ThemePreset,
  PlacedSticker,
  FilterType,
  BorderStyle,
} from '../../types/photobooth';
import { LayoutSelector } from './LayoutSelector';
import { ThemeSelector } from './ThemeSelector';
import { StickerPicker } from './StickerPicker';
import { FilterBar } from '../UI/FilterBar';
import { PersonaText } from '../../persona/personaTextEngine';

interface StripCustomizerProps {
  layout: StripLayout;
  onSelectLayout: (layout: StripLayout) => void;
  theme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
  filter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  borderStyle: BorderStyle;
  onSelectBorderStyle: (border: BorderStyle) => void;
  caption: string;
  onChangeCaption: (caption: string) => void;
  dateText: string;
  onChangeDateText: (date: string) => void;
  stickers: PlacedSticker[];
  onAddSticker: (emoji: string, id: string, dataUrl?: string, vectorSvg?: string) => void;
  onRemoveSticker: (id: string) => void;
  onRetake: () => void;
  onOpenExport: () => void;
}

const BORDER_STYLES: { id: BorderStyle; label: string }[] = [
  { id: 'neon-glow', label: 'Comic' },
  { id: 'solid', label: 'Classic' },
  { id: 'film-strip', label: '35mm Film' },
  { id: 'rounded', label: 'Rounded' },
];

const Section: React.FC<{ index: number; title: string; children: React.ReactNode }> = ({
  index,
  title,
  children,
}) => (
  <section className="space-y-4">
    <h3 className="p5-heading">
      <span className="text-p5-red mr-2">{String(index).padStart(2, '0')}</span>
      {title}
    </h3>
    <div>{children}</div>
  </section>
);

export const StripCustomizer: React.FC<StripCustomizerProps> = ({
  layout,
  onSelectLayout,
  theme,
  onSelectTheme,
  filter,
  onSelectFilter,
  borderStyle,
  onSelectBorderStyle,
  caption,
  onChangeCaption,
  dateText,
  onChangeDateText,
  stickers,
  onAddSticker,
  onRemoveSticker,
  onRetake,
  onOpenExport,
}) => {
  return (
    <div className="p5-card flex flex-col gap-8 p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <PersonaText text="Customize" size="xl" />
        <button onClick={onRetake} className="p5-btn">
          <span>Retake</span>
        </button>
      </div>

      <Section index={1} title="Layout">
        <LayoutSelector activeLayout={layout} onSelectLayout={onSelectLayout} />
      </Section>

      <Section index={2} title="Color Tone">
        <FilterBar activeFilter={filter} onSelectFilter={onSelectFilter} />
      </Section>

      <Section index={3} title="Frame">
        <ThemeSelector activeTheme={theme} onSelectTheme={onSelectTheme} />
      </Section>

      <Section index={4} title="Border">
        <div className="flex flex-wrap gap-3">
          {BORDER_STYLES.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelectBorderStyle(b.id)}
              data-active={borderStyle === b.id}
              className="p5-btn"
            >
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section index={5} title="Captions">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-display uppercase text-sm tracking-wide text-p5-white block mb-1.5">Title</span>
            <input
              type="text"
              value={caption}
              onChange={(e) => onChangeCaption(e.target.value)}
              maxLength={24}
              placeholder="FAYEFOTO"
              className="p5-input uppercase"
            />
          </label>
          <label className="block">
            <span className="font-display uppercase text-sm tracking-wide text-p5-white block mb-1.5">Date</span>
            <input
              type="text"
              value={dateText}
              onChange={(e) => onChangeDateText(e.target.value)}
              maxLength={20}
              placeholder="OCT 31, 2026"
              className="p5-input font-mono"
            />
          </label>
        </div>
      </Section>

      <Section index={6} title="Stickers">
        <StickerPicker stickers={stickers} onAddSticker={onAddSticker} onRemoveSticker={onRemoveSticker} />
      </Section>

      <button onClick={onOpenExport} className="p5-btn p5-btn-primary w-full text-3xl py-4 mt-2">
        <span>Take Your Strip</span>
      </button>
    </div>
  );
};
