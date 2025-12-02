export function applyTheme(theme: string, highContrast: boolean) {
  document.body.setAttribute('data-theme', theme);
  if (highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

export function applyTextSize(size: number) {
  document.documentElement.style.setProperty('--base-font-size', `${size}px`);
}

export function applyDyslexiaFont(enabled: boolean) {
  if (enabled) {
    document.body.classList.add('dyslexia-font');
  } else {
    document.body.classList.remove('dyslexia-font');
  }
}

export function applyColorblindFilter(filter: string) {
  document.body.setAttribute('data-colorblind', filter);
}