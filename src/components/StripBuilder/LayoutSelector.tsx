import React from 'react';
import { StripLayout } from '../../types/photobooth';

interface LayoutSelectorProps {
  activeLayout: StripLayout;
  onSelectLayout: (layout: StripLayout) => void;
}

// Each layout thumbnail is a set of [x, y, w, h] cells inside a 20x30 frame
const LAYOUTS: { id: StripLayout; label: string; cells: [number, number, number, number][] }[] = [
  { id: 'vertical-1x4', label: '1x4', cells: [[4, 3, 12, 5], [4, 9.5, 12, 5], [4, 16, 12, 5], [4, 22.5, 12, 5]] },
  { id: 'grid-2x2', label: '2x2', cells: [[3, 4, 6.5, 9], [10.5, 4, 6.5, 9], [3, 14.5, 6.5, 9], [10.5, 14.5, 6.5, 9]] },
  { id: 'classic-2x1', label: '2x1', cells: [[3, 4, 14, 9.5], [3, 15, 14, 9.5]] },
];

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({ activeLayout, onSelectLayout }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {LAYOUTS.map((item) => {
        const isSelected = activeLayout === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectLayout(item.id)}
            data-active={isSelected}
            className="p5-btn px-4 py-2"
          >
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 20 30" className="w-5 h-7" aria-hidden="true">
                <rect x="0.75" y="0.75" width="18.5" height="28.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                {item.cells.map(([x, y, w, h], i) => (
                  <rect key={i} x={x} y={y} width={w} height={h} fill={isSelected ? '#E5191C' : 'currentColor'} />
                ))}
              </svg>
              <span className="text-lg">{item.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};
