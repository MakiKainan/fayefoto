import React from 'react';
import { FilterType } from '../../types/photobooth';

interface FilterBarProps {
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

export const FILTERS:{ id: FilterType; label: string; swatch: string }[] = [
  { id: 'normal', label: 'Original', swatch: '#FDFDFD' },
  { id: 'persona-crimson', label: 'Persona Red', swatch: '#E5191C' },
  { id: 'fallen-noir', label: 'FA: Noir B&W', swatch: '#0F0F0F' },
  { id: 'fallen-amber', label: 'FA: Amber Night', swatch: '#D97706' },
  { id: 'vintage', label: 'Vintage', swatch: '#92400E' },
  { id: 'cyberpunk', label: 'Cyberpunk', swatch: '#C026D3' },
  { id: 'grayscale', label: 'Grayscale', swatch: '#A1A1AA' },
];

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onSelectFilter }) => {
  return (
    <div className="flex flex-wrap gap-3 py-1">
      {FILTERS.map((f) => {
        const isSelected = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            data-active={isSelected}
            className="p5-btn px-3 py-1.5 text-xs"
          >
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span
                className="w-3 h-3 border-2 border-current rotate-45"
                style={{ background: f.swatch }}
              />
              {f.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
