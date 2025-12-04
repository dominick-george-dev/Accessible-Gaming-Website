import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

// ===== TYPES =====

export type ColorblindFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
export type ThemeMode = 'light' | 'dark' | 'deep-space';

export interface AccessibilityPreferences {
  visual: boolean;
  hearing: boolean;
  dexterity: boolean;
  cognitive: boolean;
  textSize: number;
  highContrast: boolean;
  dyslexiaFont: boolean;
  colorblindFilter: ColorblindFilter;
  theme: ThemeMode;
  fontFamily: string;
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  magnifierEnabled: boolean;
  updatePreferences: (newPreferences: Partial<AccessibilityPreferences>) => Promise<void>;
  toggleMagnifier: () => void;
  adjustTextSize: (increment: number) => void;
  isLoading: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  visual: false,
  hearing: false,
  dexterity: false,
  cognitive: false,
  textSize: 16,
  highContrast: false,
  dyslexiaFont: false,
  colorblindFilter: 'none',
  theme: 'light',
  fontFamily: 'default',
};

// ===== CONTEXT =====

export const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// ===== PROVIDER =====

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  console.log('AccessibilityProvider mounted');
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initializePreferences = useCallback(async () => {
    console.log('AccessibilityProvider: initializePreferences called');
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const response = await fetch(`http://localhost:3000/api/accessibility-settings/${parsedUser.id}`);
      
      if (response.ok) {
        const settings = await response.json();
        const userPreferences = {
          ...DEFAULT_PREFERENCES,
          ...settings,
          dyslexiaFont: settings.fontFamily === 'OpenDyslexic',
        };
        
        setPreferences(userPreferences);
        applyAllSettings(userPreferences);
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Initialize preferences on mount
  useEffect(() => {
    initializePreferences();
  }, [initializePreferences]);
  // Cleanup magnifier on unmount
  useEffect(() => {
    return () => {
      // Cleanup handled by Magnifier component
    };
  }, [magnifierEnabled]);

  // Apply settings whenever preferences change
  useEffect(() => {
    applyAllSettings(preferences);
  }, [preferences]);

  const updatePreferences = async (newPreferences: Partial<AccessibilityPreferences>) => {
    const updatedPreferences = {
      ...preferences,
      ...newPreferences,
      fontFamily: newPreferences.dyslexiaFont ? 'OpenDyslexic' : 'default',
    };

    setPreferences(updatedPreferences);
    applyAllSettings(updatedPreferences);

    // Save to backend
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        await fetch(`http://localhost:3000/api/accessibility-settings/${parsedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPreferences),
        });
        toast.success('Preferences updated');
      }
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error('Failed to save accessibility settings:', error);
    }
  };  const toggleMagnifier = () => {
    const newState = !magnifierEnabled;
    setMagnifierEnabled(newState);
    toast.success(`Magnifier ${newState ? 'enabled' : 'disabled'}`);
  };

  const adjustTextSize = (increment: number) => {
    const newSize = Math.max(10, Math.min(32, preferences.textSize + increment));
    updatePreferences({ textSize: newSize });
    const action = increment > 0 ? 'increased' : 'decreased';
    toast.success(`Text size ${action} to ${newSize}px`);
  };

  const applyAllSettings = (prefs: AccessibilityPreferences) => {
    applyTheme(prefs.theme, prefs.highContrast);
    applyTextSize(prefs.textSize);
    applyDyslexiaFont(prefs.dyslexiaFont);
    applyColorblindFilter(prefs.colorblindFilter);
  };

  const value: AccessibilityContextType = {
    preferences,
    magnifierEnabled,
    updatePreferences,
    toggleMagnifier,
    adjustTextSize,
    isLoading,
  };
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// ===== HELPER FUNCTIONS =====

export function applyTheme(theme: ThemeMode, highContrast: boolean) {
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
  
  // Remove all filter classes
  body.classList.remove(
    'colorblind-protanopia',
    'colorblind-deuteranopia',
    'colorblind-tritanopia',
    'colorblind-achromatopsia'
  );
  
  // Apply new filter
  if (filter !== 'none') {
    body.classList.add(`colorblind-${filter}`);
  }
}