import { useContext } from 'react';
import { Magnifier } from '../ui/magnifier';
import { AccessibilityContext } from '../../context/AccessibilityContext';

export function AccessibilityComponents() {
  const context = useContext(AccessibilityContext);
  if (!context) return null;
  
  const { magnifierEnabled } = context;

  return (
    <>
      <Magnifier isActive={magnifierEnabled} magnification={2} />
      <ColorblindFilterSVGs />
    </>
  );
}

function ColorblindFilterSVGs() {
  return (
    <svg className="colorblind-filters" aria-hidden="true">
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                                 0.558, 0.442, 0,     0, 0
                                                 0,     0.242, 0.758, 0, 0
                                                 0,     0,     0,     1, 0" />
        </filter>
        
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0,   0, 0
                                                 0.7,   0.3,   0,   0, 0
                                                 0,     0.3,   0.7, 0, 0
                                                 0,     0,     0,   1, 0" />
        </filter>
        
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="0.95, 0.05,  0,     0, 0
                                                 0,    0.433, 0.567, 0, 0
                                                 0,    0.475, 0.525, 0, 0
                                                 0,    0,     0,     1, 0" />
        </filter>
      </defs>
    </svg>
  );
}