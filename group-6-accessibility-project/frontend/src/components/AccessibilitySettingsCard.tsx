import React from 'react';
import { Card, Button, Switch, Label } from '../ui';
import { useAccessibilitySettings } from '../hooks/useAccessibilitySettings';
import { Loader2, Plus, Minus } from 'lucide-react';

export function AccessibilitySettingsCard() {
  const { settings, updateSettings, loading, saving } = useAccessibilitySettings();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading accessibility settings...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
      
      <div className="space-y-4">
        {/* Text Size */}
        <div className="flex items-center justify-between">
          <Label className="flex-1">
            Text Size: {settings.textSize}px
          </Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSettings({ textSize: Math.max(10, settings.textSize - 2) })}
              disabled={saving || settings.textSize <= 10}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSettings({ textSize: Math.min(32, settings.textSize + 2) })}
              disabled={saving || settings.textSize >= 32}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>        {/* Color Mode (Dark Mode) */}
        <div className="flex items-center justify-between">
          <Label htmlFor="dark-mode">Dark Mode</Label>
          <Switch
            id="dark-mode"
            checked={settings.colourMode === 'dark-mode'}
            onCheckedChange={(checked) => updateSettings({ colourMode: checked ? 'dark-mode' : 'light-mode' })}
            disabled={saving}
          />
        </div>

        {/* High Contrast */}
        <div className="flex items-center justify-between">
          <Label htmlFor="high-contrast">High Contrast</Label>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
            disabled={saving}
          />
        </div>

        {/* Visual Accessibility */}
        <div className="flex items-center justify-between">
          <Label htmlFor="visual-accessibility">Visual Accessibility</Label>
          <Switch
            id="visual-accessibility"
            checked={settings.visualAccessibility}
            onCheckedChange={(checked) => updateSettings({ visualAccessibility: checked })}
            disabled={saving}
          />
        </div>

        {/* Hearing Accessibility */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hearing-accessibility">Hearing Accessibility</Label>
          <Switch
            id="keyboard-nav"
            checked={settings.keyboardNavigation}
            onCheckedChange={(checked) => updateSettings({ keyboardNavigation: checked })}
            disabled={saving}
          />
        </div>

        {/* Simplified Interface */}
        <div className="flex items-center justify-between">
          <Label htmlFor="simplified">Simplified Interface</Label>
          <Switch
            id="simplified"
            checked={settings.simplifiedInterface}
            onCheckedChange={(checked) => updateSettings({ simplifiedInterface: checked })}
            disabled={saving}
          />
        </div>

        {/* Font Family */}
        <div className="flex items-center justify-between">
          <Label htmlFor="dyslexic-font">Dyslexic-Friendly Font</Label>
          <Switch
            id="dyslexic-font"
            checked={settings.fontFamily === 'dyslexic'}
            onCheckedChange={(checked) => 
              updateSettings({ fontFamily: checked ? 'dyslexic' : 'default' })
            }
            disabled={saving}
          />
        </div>
      </div>

      {saving && (
        <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Saving settings...
        </div>
      )}
    </Card>
  );
}
