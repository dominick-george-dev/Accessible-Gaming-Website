// ColorblindFilterContext.ts
// Shared logic and types for colorblind filter system
import { useEffect, useState } from 'react';

export type ColorblindFilter =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

export interface ColorblindFilterOption {
  value: ColorblindFilter;
  label: string;
  description: string;
}

export const COLORBLIND_FILTERS: ColorblindFilterOption[] = [
  {
    value: 'none',
    label: 'None',
    description: 'No filter applied - standard color vision',
  },
  {
    value: 'protanopia',
    label: 'Protanopia',
    description: 'Red-blind (difficulty seeing red colors)',
  },
  {
    value: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Green-blind (difficulty seeing green colors)',
  },
  {
    value: 'tritanopia',
    label: 'Tritanopia',
    description: 'Blue-blind (difficulty seeing blue colors)',
  },
  {
    value: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Complete color blindness (monochromacy)',
  },
];

export function useColorblindFilter(
  initialFilter: ColorblindFilter = 'none',
  onFilterChange?: (filter: ColorblindFilter) => void
) {
  const [currentFilter, setCurrentFilter] = useState<ColorblindFilter>(initialFilter);

  useEffect(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'colorblind-filters');
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                                 0.558, 0.442, 0,     0, 0
                                                 0,     0.242, 0.758, 0, 0
                                                 0,     0,     0,     1, 0"/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0,   0, 0
                                                 0.7,   0.3,   0,   0, 0
                                                 0,     0.3,   0.7, 0, 0
                                                 0,     0,     0,   1, 0"/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95, 0.05,  0,     0, 0
                                                 0,    0.433, 0.567, 0, 0
                                                 0,    0.475, 0.525, 0, 0
                                                 0,    0,     0,     1, 0"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
    return () => {
      if (svg.parentNode) svg.parentNode.removeChild(svg);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove(
      'colorblind-protanopia',
      'colorblind-deuteranopia',
      'colorblind-tritanopia',
      'colorblind-achromatopsia'
    );
    if (currentFilter && currentFilter !== 'none') {
      document.documentElement.classList.add(`colorblind-${currentFilter}`);
    }
    if (onFilterChange) onFilterChange(currentFilter);
  }, [currentFilter, onFilterChange]);

  return {
    currentFilter,
    setFilter: setCurrentFilter,
    filterOptions: COLORBLIND_FILTERS,
    clearFilter: () => setCurrentFilter('none'),
  };
}
