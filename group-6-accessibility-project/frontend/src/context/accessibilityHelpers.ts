// Accessibility helper functions
import { ColorblindFilter, ThemeMode } from './AccessibilityContext';

export function applyTheme(theme: ThemeMode, highContrast: boolean) {
  const html = document.documentElement;
  html.classList.remove('light', 'dark', 'deep-space', 'high-contrast');
  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'deep-space') {
    html.classList.add('deep-space');
  }
  if (highContrast) {
    html.classList.add('high-contrast');
  }
}

export function applyTextSize(size: number) {
  document.documentElement.style.setProperty('--font-size', `${size}px`);
}

export function applyDyslexiaFont(enabled: boolean) {
  if (enabled) {
    document.body.classList.add('dyslexia-font');
  } else {
    document.body.classList.remove('dyslexia-font');
  }
}

export function applyColorblindFilter(filter: ColorblindFilter) {
  const body = document.body;
  body.classList.remove(
    'colorblind-protanopia',
    'colorblind-deuteranopia',
    'colorblind-tritanopia',
    'colorblind-achromatopsia'
  );
  if (filter !== 'none') {
    body.classList.add(`colorblind-${filter}`);
  }
}
