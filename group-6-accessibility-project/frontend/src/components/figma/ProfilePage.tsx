import React, { useState } from 'react';
import {
  Settings,
  Eye,
  Ear,
  Hand,
  Brain,
  Type,
  Moon,
  Contrast,
  Palette,
  Search,
  Undo,
  Minus,
  Plus,
} from 'lucide-react';
import {
  Card,
  Button,
  Switch,
  Label,
  Separator,
  Badge,
  Avatar,
  AvatarFallback,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  toast,
} from '../ui';
import Magnifier from '../Magnifier';

// ===== TYPES =====

type ColorblindFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
type ThemeMode = 'light' | 'dark' | 'deep-space';

interface User {
  id: string;
  name: string;
  email: string;
  favorites: string[];
  isAdmin: boolean;
  isPublisher: boolean;
  publisherId?: string;
  accessibilityPreferences: {
    visual: boolean;
    hearing: boolean;
    dexterity: boolean;
    cognitive: boolean;
    textSize: number;
    highContrast: boolean;
    dyslexiaFont: boolean;
    colorblindFilter: ColorblindFilter;
    theme: ThemeMode;
  };
}

// ===== MOCK USER DATA =====

const MOCK_USER: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  favorites: ['game1', 'game2', 'game3'],
  isAdmin: false,
  isPublisher: false,
  accessibilityPreferences: {
    visual: false,
    hearing: false,
    dexterity: false,
    cognitive: false,
    textSize: 16,
    highContrast: false,
    dyslexiaFont: false,
    colorblindFilter: 'none',
    theme: 'light',
  },
};

// ===== MAIN COMPONENT =====

export default function ProfilePage() {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);

  // Update preferences handler
  const handleUpdatePreferences = (preferences: User['accessibilityPreferences']) => {
    setUser(prev => ({
      ...prev,
      accessibilityPreferences: preferences,
    }));

    // Apply theme changes
    applyTheme(preferences.theme, preferences.highContrast);
    
    // Apply text size changes
    applyTextSize(preferences.textSize);
    
    // Apply dyslexia font
    applyDyslexiaFont(preferences.dyslexiaFont);
    
    // Apply colorblind filter
    applyColorblindFilter(preferences.colorblindFilter);

    toast.success('Preferences updated');
  };

  // Preference change handler
  const handlePreferenceChange = (
    category: keyof User['accessibilityPreferences'],
    value: boolean | ColorblindFilter | ThemeMode
  ) => {
    const newPreferences = {
      ...user.accessibilityPreferences,
      [category]: value,
    };
    handleUpdatePreferences(newPreferences);
  };

  // Text size adjustment
  const handleTextSizeChange = (increment: number) => {
    const currentSize = user.accessibilityPreferences.textSize;
    const newSize = Math.max(10, Math.min(32, currentSize + increment));
    
    handleUpdatePreferences({
      ...user.accessibilityPreferences,
      textSize: newSize,
    });
    
    const action = increment > 0 ? 'increased' : 'decreased';
    toast.success(`Text size ${action} to ${newSize}px`);
  };

  // Keyboard handler for text size buttons
  const handleKeyDown = (e: React.KeyboardEvent, increment: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTextSizeChange(increment);
    }
  };

  // Toggle magnifier
  const handleToggleMagnifier = () => {
    setMagnifierEnabled(prev => !prev);
    toast.success(magnifierEnabled ? 'Magnifier disabled' : 'Magnifier enabled');
  };

  // Preference options
  const preferences = [
    { id: 'visual', icon: Eye, label: 'Visual Accessibility' },
    { id: 'hearing', icon: Ear, label: 'Hearing Accessibility' },
    { id: 'dexterity', icon: Hand, label: 'Motor/Dexterity Accessibility' },
    { id: 'cognitive', icon: Brain, label: 'Cognitive Accessibility' },
  ];

  const colorblindFilters: { value: ColorblindFilter; label: string; description: string }[] = [
    { value: 'none', label: 'None', description: 'No filter applied' },
    { value: 'protanopia', label: 'Protanopia', description: 'Red-blind (difficulty seeing red)' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Green-blind (difficulty seeing green)' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-blind (difficulty seeing blue)' },
    { value: 'achromatopsia', label: 'Achromatopsia', description: 'Complete color blindness' },
  ];

  const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
    { value: 'light', label: 'Light Mode', description: 'Bright, clean interface' },
    { value: 'dark', label: 'Dark Mode', description: 'Reduced eye strain in low light' },
    { value: 'deep-space', label: 'Deep Space', description: 'Dark blue/purple gradient theme' },
  ];

  return (
    <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* User Info */}
      <Card className="p-4 lg:p-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <Avatar className="w-16 h-16 lg:w-24 lg:h-24">
            <AvatarFallback className="bg-blue-600 text-white text-xl lg:text-2xl">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="mb-1 lg:mb-2">{user.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            {user.isAdmin && (
              <Badge variant="secondary" className="mt-2">Administrator</Badge>
            )}
            {user.isPublisher && (
              <Badge variant="secondary" className="mt-2">Publisher</Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Favorites</div>
          <div className="text-3xl lg:text-4xl">{user.favorites.length}</div>
        </Card>
        <Card className="p-4 lg:p-6 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Reviews</div>
          <div className="text-3xl lg:text-4xl">0</div>
        </Card>
      </div>

      <Separator />

      {/* Accessibility Preferences */}
      <section aria-labelledby="preferences-heading">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <Settings className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          <h2 id="preferences-heading">Accessibility Preferences</h2>
        </div>
        <Card className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Set your accessibility needs to get better game recommendations
          </p>
          <Separator />
          
          {/* Text Size Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Type className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <Label id="text-size-label">Text Size</Label>
            </div>
            <div className="flex items-center gap-4 ml-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTextSizeChange(-2)}
                onKeyDown={(e) => handleKeyDown(e, -2)}
                aria-label="Decrease text size by 2 pixels"
                aria-describedby="text-size-label text-size-value"
              >
                <Minus className="w-4 h-4" aria-hidden="true" />
              </Button>
              
              <div 
                className="flex-1 text-center"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                id="text-size-value"
              >
                Current: {user.accessibilityPreferences.textSize}px
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleTextSizeChange(2)}
                onKeyDown={(e) => handleKeyDown(e, 2)}
                aria-label="Increase text size by 2 pixels"
                aria-describedby="text-size-label text-size-value"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-10" id="text-size-hint">
              Adjust the base text size for the entire site. Range: 10-32 pixels.
            </p>
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Moon className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <Label htmlFor="theme-selector">Theme</Label>
            </div>
            <div className="ml-10">              <Select
                value={user.accessibilityPreferences.theme}
                onValueChange={(value) => handlePreferenceChange('theme', value as ThemeMode)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Choose your preferred color scheme
              </p>
            </div>
          </div>

          <Separator />

          {/* Dyslexia-Friendly Font */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Type className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
              </div>
              <Switch
                id="dyslexia-font"
                checked={user.accessibilityPreferences.dyslexiaFont}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('dyslexiaFont', checked)
                }
                aria-label={`${user.accessibilityPreferences.dyslexiaFont ? 'Disable' : 'Enable'} Dyslexia-Friendly Font`}
              />
            </div>
          </div>

          <Separator />

          {/* High Contrast Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Contrast className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
              </div>
              <Switch
                id="high-contrast"
                checked={user.accessibilityPreferences.highContrast}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('highContrast', checked)
                }
                aria-label={`${user.accessibilityPreferences.highContrast ? 'Disable' : 'Enable'} High Contrast Mode`}
              />
            </div>
          </div>

          <Separator />

          {/* Colorblind Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Palette className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <Label htmlFor="colorblind-filter">Colorblind Filter</Label>
            </div>
            <div className="ml-10">              <Select
                value={user.accessibilityPreferences.colorblindFilter}
                onValueChange={(value) => handlePreferenceChange('colorblindFilter', value as ColorblindFilter)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent>
                  {colorblindFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      <div>
                        <div className="font-medium">{filter.label}</div>
                        <div className="text-sm text-gray-500">{filter.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Simulates colors for different types of color vision deficiency
              </p>
            </div>
          </div>

          <Separator />

          {/* Screen Magnifier */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Search className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
                <Label htmlFor="magnifier">Screen Magnifier</Label>
              </div>
              <Switch
                id="magnifier"
                checked={magnifierEnabled}
                onCheckedChange={handleToggleMagnifier}
                aria-label={`${magnifierEnabled ? 'Disable' : 'Enable'} Screen Magnifier`}
              />
            </div>
          </div>

          <Separator />
          
          {/* Accessibility Category Toggles */}
          {preferences.map((pref) => {
            const Icon = pref.icon;
            const isEnabled = user.accessibilityPreferences[pref.id as keyof User['accessibilityPreferences']] as boolean;
            
            return (
              <div key={pref.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Icon className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
                  <Label htmlFor={pref.id}>{pref.label}</Label>
                </div>
                <Switch
                  id={pref.id}
                  checked={isEnabled}
                  onCheckedChange={(checked) =>
                    handlePreferenceChange(
                      pref.id as keyof User['accessibilityPreferences'],
                      checked
                    )
                  }
                  aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${pref.label}`}
                />
              </div>
            );
          })}
        </Card>
      </section>

      {/* Active Preferences Badge */}
      {(Object.entries(user.accessibilityPreferences).some(([key, enabled]) => 
        key !== 'textSize' && key !== 'colorblindFilter' && key !== 'theme' && enabled
      ) || user.accessibilityPreferences.textSize !== 16 || user.accessibilityPreferences.colorblindFilter !== 'none' || user.accessibilityPreferences.theme !== 'light') && (
        <Card className="p-6">
          <p className="mb-4">Your active preferences:</p>
          <div className="flex flex-wrap gap-3">            {Object.entries(user.accessibilityPreferences)
              .filter(([key, enabled]) => key !== 'textSize' && key !== 'colorblindFilter' && key !== 'theme' && enabled)
              .map(([pref]) => (
                <Badge key={pref} variant="secondary" className="px-3 py-1">
                  {pref === 'highContrast' 
                    ? 'High Contrast' 
                    : pref === 'dyslexiaFont'
                    ? 'Dyslexia Font'
                    : pref.charAt(0).toUpperCase() + pref.slice(1)}
                </Badge>
              ))}
            {user.accessibilityPreferences.theme !== 'light' && (
              <Badge variant="secondary" className="px-3 py-1">
                {themeOptions.find(t => t.value === user.accessibilityPreferences.theme)?.label}
              </Badge>
            )}
            {user.accessibilityPreferences.textSize !== 16 && (
              <Badge variant="secondary" className="px-3 py-1">
                Text Size: {user.accessibilityPreferences.textSize}px
              </Badge>
            )}
            {user.accessibilityPreferences.colorblindFilter !== 'none' && (
              <Badge variant="secondary" className="px-3 py-1">
                {colorblindFilters.find(f => f.value === user.accessibilityPreferences.colorblindFilter)?.label}
              </Badge>
            )}
            {magnifierEnabled && (
              <Badge variant="secondary" className="px-3 py-1">
                Magnifier Enabled
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <Card className="p-6">
        <h3 className="mb-4">Additional Accessibility Features</h3>
        <ul className="space-y-3 text-gray-600 dark:text-gray-400" role="list">
          <li className="flex items-start gap-3">
            <Undo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Undo Button:</span> Located at the bottom-right of the screen to undo your last action
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Search Autofill:</span> The search bar provides suggestions as you type
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Type className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Breadcrumb Navigation:</span> Click on breadcrumbs at the top of pages to navigate quickly
            </div>
          </li>
        </ul>
      </Card>

      {/* Magnifier Component */}
      <Magnifier enabled={magnifierEnabled} zoom={2} />

      {/* Colorblind Filter SVGs */}
      <ColorblindFilterSVGs />
    </main>
  );
}

// ===== HELPER FUNCTIONS =====

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

// ===== COLORBLIND FILTER SVG COMPONENT =====

function ColorblindFilterSVGs() {
  return (
    <svg className="colorblind-filters" aria-hidden="true">
      <defs>
        {/* Protanopia (Red-blind) */}
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0,     0, 0
                                                 0.558, 0.442, 0,     0, 0
                                                 0,     0.242, 0.758, 0, 0
                                                 0,     0,     0,     1, 0" />
        </filter>
        
        {/* Deuteranopia (Green-blind) */}
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0,   0, 0
                                                 0.7,   0.3,   0,   0, 0
                                                 0,     0.3,   0.7, 0, 0
                                                 0,     0,     0,   1, 0" />
        </filter>
        
        {/* Tritanopia (Blue-blind) */}
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
