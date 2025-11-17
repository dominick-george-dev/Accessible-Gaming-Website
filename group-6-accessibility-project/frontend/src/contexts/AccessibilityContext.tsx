import React, { createContext, useContext, useEffect } from 'react';
import { useAccessibilitySettings, type AccessibilityPreferences } from '../hooks/useAccessibilitySettings';
import { useAuth } from './AuthContext';

type ThemeMode = 'light' | 'dark' | 'deep-space';
type ColorblindFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

interface AccessibilityContextType {
  settings: AccessibilityPreferences | null;
  updateSettings: (newSettings: Partial<AccessibilityPreferences>) => Promise<void>;
  loading: boolean;
  saving: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Helper functions moved from ProfilePage
function applyTheme(theme: ThemeMode, highContrast: boolean) {
  const html = document.documentElement;
  
  // Remove all theme classes
  html.classList.remove('light', 'dark', 'deep-space', 'high-contrast');
  
  // Apply theme
  if (theme === 'dark') {
    html.classList.add('dark');
  } else if (theme === 'deep-space') {
    html.classList.add('deep-space');
  }
  
  // Apply high contrast
  if (highContrast) {
    html.classList.add('high-contrast');
  }
}

function applyTextSize(size: number) {
  document.documentElement.style.setProperty('--font-size', `${size}px`);
}

function applyDyslexiaFont(enabled: boolean) {
  if (enabled) {
    document.body.classList.add('dyslexia-font');
  } else {
    document.body.classList.remove('dyslexia-font');
  }
}

function applyColorblindFilter(filter: ColorblindFilter) {
  const body = document.body;
  
  // Remove existing filters
  body.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia');
  
  // Apply new filter
  if (filter !== 'none') {
    body.classList.add(filter);
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { settings, updateSettings, loading, saving } = useAccessibilitySettings(user?.id);

  // Apply accessibility settings whenever they change
  useEffect(() => {
    if (!loading && settings) {
      // Map backend settings to theme format
      const theme = settings.colourMode === 'dark-mode' ? 'dark' : 
                   settings.colourMode === 'deep-space' ? 'deep-space' : 'light';
      
      // Apply all accessibility settings
      applyTheme(theme, settings.highContrast);
      applyTextSize(settings.textSize || 16);
      applyDyslexiaFont(settings.fontFamily === 'dyslexic');
      applyColorblindFilter(settings.colorBlindMode || 'none');
    }
  }, [settings, loading]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, loading, saving }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider');
  }
  return context;
}
