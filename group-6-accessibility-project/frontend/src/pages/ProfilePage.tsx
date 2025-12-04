import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Settings, Eye, Ear, Hand, Brain, Minus, Plus, Type, Contrast, Palette, Search, Undo, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility, type ColorblindFilter, type ThemeMode } from '../context/AccessibilityContext';
import { AccessibilityComponents } from '../components/accessibility/AccessibilityComponents';

// ===== TYPES =====

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
    fontFamily: string;
  };
}

// ===== MAIN COMPONENT =====

export default function ProfilePageStandalone() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();  const { 
    preferences, 
    updatePreferences, 
    adjustTextSize
  } = useAccessibility();
  // Fetch user and accessibility settings on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    console.log('User in localStorage on ProfilePage load:', storedUser);
    if (!storedUser) {
      setLoading(false);
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    // The accessibility context will handle loading the settings
    setUser({ ...parsedUser, accessibilityPreferences: preferences });
    setLoading(false);
  }, [preferences]);
  // Update preferences handler

  const handleUpdatePreferences = async (newPrefs: User['accessibilityPreferences']) => {
    if (!user) return;
    console.log('Test %^*£$%^"%"*');
    setUser(prev => prev ? { ...prev, accessibilityPreferences: newPrefs } : null);
    await updatePreferences(newPrefs);
  };
  // Preference change handler
  const handlePreferenceChange = (
    category: keyof User['accessibilityPreferences'],
    value: boolean | ColorblindFilter | ThemeMode | string | number
  ) => {
    if (!user) return;
    const current = user.accessibilityPreferences;
    const newPreferences: User['accessibilityPreferences'] = {
      ...current,
      [category]: value,
    };
    handleUpdatePreferences(newPreferences);
  };

  // Text size adjustment
  const handleTextSizeChange = (increment: number) => {
    adjustTextSize(increment);
  };

  // Keyboard handler for text size buttons
  const handleKeyDown = (e: React.KeyboardEvent, increment: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTextSizeChange(increment);
    }
  };
  // Preference options
  const accessibilityOptions = [
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

  const fontFamilyOptions: { value: string; label: string; description: string }[] = [
    { value: 'default', label: 'Default', description: 'System default font' },
    { value: 'serif', label: 'Serif', description: 'Traditional serif font (Times New Roman)' },
    { value: 'sans-serif', label: 'Sans Serif', description: 'Clean sans-serif font (Arial/Helvetica)' },
    { value: 'monospace', label: 'Monospace', description: 'Fixed-width font (Courier)' },
    { value: 'dyslexic', label: 'OpenDyslexic', description: 'Specialized font for dyslexia' },
  ];

  if (loading) {
    return <main className="max-w-4xl mx-auto p-4 lg:p-6"><p>Loading...</p></main>;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700 max-w-md w-full">
          <h2 className="text-3xl font-bold mb-4 text-primary">Profile</h2>
          <p className="mb-6 text-lg text-gray-700 dark:text-gray-200 text-center">
            You must be logged in to access your profile.
          </p>
          <button
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold shadow hover:bg-primary-foreground transition-colors duration-200"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="browse-page-center px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
    <div className="max-w-5xl w-full">

      {/* Accessibility Preferences */}
      <section aria-labelledby="preferences-heading">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <Settings className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
          <h2 id="preferences-heading">Accessibility Preferences</h2>
        </div>
        <Card className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          <p className="text-muted-foreground">
            Set your accessibility needs to get better game recommendations
          </p>
          <Separator />
          
          {/* Text Size Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Type className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
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
              >
                <span 
                  id="text-size-value"
                  className="px-4 py-2 bg-muted rounded-md inline-block min-w-[80px]"
                >
                  {user?.accessibilityPreferences.textSize}px
                </span>
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
            <p className="text-muted-foreground ml-10" id="text-size-hint">
              Adjust the base text size for the entire site. Range: 10-32 pixels.
            </p>
          </div>

          <Separator />

          {/* Theme Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Moon className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
              <Label htmlFor="theme-selector">Theme</Label>
            </div>
            <div className="ml-10">
              <Select
                value={user?.accessibilityPreferences.theme}
                onValueChange={(value: ThemeMode) => handlePreferenceChange('theme', value)}
              >
                <SelectTrigger id="theme-selector" aria-label="Select theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div>
                        <div>{theme.label}</div>
                        <div className="text-muted-foreground">{theme.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground mt-2">
                Choose your preferred color scheme
              </p>
            </div>
          </div>

          <Separator />

          {/* Dyslexia-Friendly Font */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Type className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <Label htmlFor="dyslexia-font" className="cursor-pointer">
                    Dyslexia-Friendly Font
                  </Label>
                  <p className="text-muted-foreground mt-1">
                    Uses a font designed to improve readability for users with dyslexia
                  </p>
                </div>
              </div>
              <Switch
                id="dyslexia-font"
                checked={Boolean(user?.accessibilityPreferences.dyslexiaFont)}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('dyslexiaFont', checked)
                }
                aria-label={`${user?.accessibilityPreferences.dyslexiaFont ? 'Disable' : 'Enable'} Dyslexia-Friendly Font`}
              />
            </div>
          </div>

          <Separator />

          {/* High Contrast Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Contrast className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <Label htmlFor="high-contrast" className="cursor-pointer">
                    High Contrast Mode
                  </Label>
                  <p className="text-muted-foreground mt-1">
                    Increases color contrast for better visibility
                  </p>
                </div>
              </div>
              <Switch
                id="high-contrast"
                checked={Boolean(user?.accessibilityPreferences.highContrast)}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('highContrast', checked)
                }
                aria-label={`${user?.accessibilityPreferences.highContrast ? 'Disable' : 'Enable'} High Contrast Mode`}
              />
            </div>
          </div>

          <Separator />

          {/* Colorblind Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Palette className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
              <Label htmlFor="colorblind-filter">Colorblind Filter</Label>
            </div>
            <div className="ml-10">
              <Select
                value={user?.accessibilityPreferences.colorblindFilter}
                onValueChange={(value: ColorblindFilter) => handlePreferenceChange('colorblindFilter', value)}
              >
                <SelectTrigger id="colorblind-filter" aria-label="Select colorblind filter">
                  <SelectValue placeholder="Select a filter" />
                </SelectTrigger>
                <SelectContent>
                  {colorblindFilters.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      <div>
                        <div>{filter.label}</div>
                        <div className="text-muted-foreground">{filter.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground mt-2">
                Simulates colors for different types of color vision deficiency
              </p>
            </div>
          </div>          <Separator />
            {/* Accessibility Category Toggles */}
          {accessibilityOptions.map((pref) => {
            const Icon = pref.icon;
            const isEnabled = user?.accessibilityPreferences[pref.id as keyof User['accessibilityPreferences']];
            
            return (
              <div key={pref.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
                  <Label htmlFor={pref.id} className="cursor-pointer">
                    {pref.label}
                  </Label>
                </div>
                <Switch
                  id={pref.id}
                  checked={Boolean(isEnabled)}
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
      </section>      {/* Active Preferences Badge */}
      {(Object.entries(user?.accessibilityPreferences || {}).some(([key, enabled]) => 
        key !== 'textSize' && key !== 'colorblindFilter' && key !== 'theme' && key !== 'fontFamily' && enabled
      ) || user?.accessibilityPreferences.textSize !== 16 || user?.accessibilityPreferences.colorblindFilter !== 'none' || user?.accessibilityPreferences.theme !== 'light' || user?.accessibilityPreferences.fontFamily !== 'default') && (
        <Card className="p-6">
          <p className="mb-4">Your active preferences:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(user?.accessibilityPreferences || {})
              .filter(([key, enabled]) => key !== 'textSize' && key !== 'colorblindFilter' && key !== 'theme' && key !== 'fontFamily' && enabled)
              .map(([pref]) => (
                <Badge key={pref} variant="secondary" className="px-3 py-1">
                  {pref === 'highContrast' 
                    ? 'High Contrast' 
                    : pref === 'dyslexiaFont'
                    ? 'Dyslexia Font'
                    : pref.charAt(0).toUpperCase() + pref.slice(1)}
                </Badge>
              ))}
            {user?.accessibilityPreferences.theme !== 'light' && (
              <Badge variant="secondary" className="px-3 py-1">
                {themeOptions.find(t => t.value === user?.accessibilityPreferences.theme)?.label}
              </Badge>
            )}
            {user?.accessibilityPreferences.fontFamily !== 'default' && (
              <Badge variant="secondary" className="px-3 py-1">
                {fontFamilyOptions.find(f => f.value === user?.accessibilityPreferences.fontFamily)?.label}
              </Badge>
            )}
            {user?.accessibilityPreferences.textSize !== 16 && (
              <Badge variant="secondary" className="px-3 py-1">
                Text Size: {user?.accessibilityPreferences.textSize}px
              </Badge>
            )}            {user?.accessibilityPreferences.colorblindFilter !== 'none' && (
              <Badge variant="secondary" className="px-3 py-1">
                {colorblindFilters.find(f => f.value === user?.accessibilityPreferences.colorblindFilter)?.label}
              </Badge>
            )}
          </div>
        </Card>
      )}

      {/* Additional Info */}
      <Card className="p-6">
        <h3 className="mb-4">Additional Accessibility Features</h3>
        <ul className="space-y-3 text-muted-foreground" role="list">
          <li className="flex items-start gap-3">
            <Undo className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-foreground">Undo Button:</span> Located at the bottom-right of the screen to undo your last action
            </div>
          </li>          <li className="flex items-start gap-3">
            <Search className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-foreground">Screen Magnifier:</span> Click the magnifier button in the top header to enable/disable screen magnification
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Search className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-foreground">Search Autofill:</span> The search bar provides suggestions as you type
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Type className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-foreground">Breadcrumb Navigation:</span> Click on breadcrumbs at the top of pages to navigate quickly
            </div>
          </li></ul>
      </Card>      {/* Accessibility Components */}
      <AccessibilityComponents />
    </div>
    </div>
  );
}
