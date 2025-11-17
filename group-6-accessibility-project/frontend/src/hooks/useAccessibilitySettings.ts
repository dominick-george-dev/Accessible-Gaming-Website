import { useState, useEffect } from 'react';
import { 
  getUserAccessibilitySettings, 
  updateUserAccessibilitySettings, 
  type UserAccessibilitySettings 
} from '../services/api';
import { toast } from 'sonner';

export interface AccessibilityPreferences {
  // Text settings
  textSize: number;
  fontFamily: 'default' | 'dyslexic';
  
  // Visual settings
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
  colourMode: 'light-mode' | 'dark-mode' | 'deep-space';
  
  // Accessibility preferences
  visualAccessibility: boolean;
  hearingAccessibility: boolean;
  motorDexterityAccessibility: boolean;
  cognitiveAccessibility: boolean;
  
  // Magnifier
  screenMagnifier: boolean;
}

export function useAccessibilitySettings(userId: number = 1) {
  const [settings, setSettings] = useState<AccessibilityPreferences>({
    textSize: 16,
    fontFamily: 'default',
    highContrast: false,
    colorBlindMode: 'none',
    colourMode: 'light-mode',
    visualAccessibility: false,
    hearingAccessibility: false,
    motorDexterityAccessibility: false,
    cognitiveAccessibility: false,
    screenMagnifier: false,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const backendSettings = await getUserAccessibilitySettings(userId);
        
        // Map backend to frontend format
        setSettings({
          textSize: backendSettings.textSize || 16,
          fontFamily: (backendSettings.fontFamily as 'default' | 'dyslexic') || 'default',
          highContrast: backendSettings.highContrast || false,
          colorBlindMode: (backendSettings.colorBlindMode as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia') || 'none',
          colourMode: (backendSettings.colourMode as 'light-mode' | 'dark-mode' | 'deep-space') || 'light-mode',
          visualAccessibility: backendSettings.visualAccessibility || false,
          hearingAccessibility: backendSettings.hearingAccessibility || false,
          motorDexterityAccessibility: backendSettings.motorDexterityAccessibility || false,
          cognitiveAccessibility: backendSettings.cognitiveAccessibility || false,
          screenMagnifier: backendSettings.screenMagnifier || false,
        });
        
        toast.success('Settings loaded successfully');
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
        toast.error('Failed to load settings. Using defaults.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);
  // Save settings to backend
  const updateSettings = async (newSettings: Partial<AccessibilityPreferences>) => {
    try {
      setSaving(true);
      
      const updatedSettings = { ...settings, ...newSettings };
      
      // Map frontend to backend format
      const backendSettings: Partial<UserAccessibilitySettings> = {
        textSize: updatedSettings.textSize,
        fontFamily: updatedSettings.fontFamily,
        highContrast: updatedSettings.highContrast,
        colorBlindMode: updatedSettings.colorBlindMode,
        colourMode: updatedSettings.colourMode,
        visualAccessibility: updatedSettings.visualAccessibility,
        hearingAccessibility: updatedSettings.hearingAccessibility,
        motorDexterityAccessibility: updatedSettings.motorDexterityAccessibility,
        cognitiveAccessibility: updatedSettings.cognitiveAccessibility,
        screenMagnifier: updatedSettings.screenMagnifier,
      };
      
      // Save to backend first, only update local state on success
      await updateUserAccessibilitySettings(userId, backendSettings);
      
      // Only update state after successful API call to prevent unnecessary re-renders
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
      
    } catch (error) {
      console.error('Failed to save accessibility settings:', error);
      toast.error('Failed to save settings. Please try again.');
      // Don't update state on error - keep current settings
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    updateSettings,
    loading,
    saving,
  };
}
