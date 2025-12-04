import React, { useEffect } from 'react';
import { applyTheme, applyTextSize, applyDyslexiaFont, applyColorblindFilter } from '../context/AccessibilityContext';

const AccessibilitySettings = () => {
  useEffect(() => {
    // Fetch and apply accessibility settings from backend on mount
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    const fetchAndApplyPrefs = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/accessibility-settings/${parsedUser.id}`);
        let prefs;
        if (response.ok) {
          prefs = await response.json();
        } else {
          prefs = parsedUser.accessibilityPreferences;
        }
        if (prefs) {
          applyTheme(prefs.theme, prefs.highContrast);
          applyTextSize(prefs.textSize);
          applyDyslexiaFont(prefs.dyslexiaFont);
          applyColorblindFilter(prefs.colorblindFilter);
        }
      } catch (error) {
        // fallback to localStorage prefs
        const prefs = parsedUser.accessibilityPreferences;
        if (prefs) {
          applyTheme(prefs.theme, prefs.highContrast);
          applyTextSize(prefs.textSize);
          applyDyslexiaFont(prefs.dyslexiaFont);
          applyColorblindFilter(prefs.colorblindFilter);
        }
      }
    };
    fetchAndApplyPrefs();
  }, []);

  return <div>Accessibility Settings Component</div>;
};

export default AccessibilitySettings;