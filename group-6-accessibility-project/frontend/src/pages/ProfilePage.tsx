import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LogOut, User as UserIcon, Settings, Eye, Ear, Hand, Brain, Minus, Plus, Type, Contrast, Palette, Search, Undo, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { Magnifier } from '../components/ui/magnifier';
import { Header } from '../components/Navigation';
import { useNavigate } from 'react-router-dom';

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
    fontFamily: string;
  };
}

// ===== MOCK USER FOR FALLBACK =====
const MOCK_USER: User = {
  id: '0',
  name: 'Mock User',
  email: 'mockuser@email.com',
  favorites: [],
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
    fontFamily: 'default',
  },
};

// ===== MAIN COMPONENT =====

export default function ProfilePageStandalone() {
  const [user, setUser] = useState<User | null>(null);
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user and accessibility settings on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('User in localStorage on ProfilePage load:', storedUser);
    if (!storedUser) {
      setLoading(false);
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    fetch(`http://localhost:3000/api/accessibility-settings/${parsedUser.id}`)
      .then(res => res.json())
      .then(settings => {
        const userWithPrefs = { ...parsedUser, accessibilityPreferences: settings || MOCK_USER.accessibilityPreferences };
        setUser(userWithPrefs);
        // Apply settings after fetching
        applyTheme(userWithPrefs.accessibilityPreferences.theme, userWithPrefs.accessibilityPreferences.highContrast);
        applyTextSize(userWithPrefs.accessibilityPreferences.textSize);
        // Use fontFamily from backend to determine dyslexia font
        applyDyslexiaFont(userWithPrefs.accessibilityPreferences.fontFamily === 'OpenDyslexic');
        applyColorblindFilter(userWithPrefs.accessibilityPreferences.colorblindFilter);
        setLoading(false);
      })
      .catch(() => {
        setUser({ ...parsedUser, accessibilityPreferences: MOCK_USER.accessibilityPreferences });
        setLoading(false);
      });
  }, []);

  // Update preferences handler
  const handleUpdatePreferences = async (preferences: User['accessibilityPreferences']) => {
    if (!user) return;
    // Ensure all fields are present
    const fullPreferences: User['accessibilityPreferences'] = {
      visual: preferences.visual ?? false,
      hearing: preferences.hearing ?? false,
      dexterity: preferences.dexterity ?? false,
      cognitive: preferences.cognitive ?? false,
      textSize: preferences.textSize ?? 16,
      highContrast: preferences.highContrast ?? false,
      dyslexiaFont: preferences.dyslexiaFont ?? false,
      colorblindFilter: preferences.colorblindFilter ?? 'none',
      theme: preferences.theme ?? 'light',
      fontFamily: preferences.dyslexiaFont ? 'OpenDyslexic' : 'default',
    };
    setUser(prev => prev ? { ...prev, accessibilityPreferences: fullPreferences } : null);

    // Apply theme changes
    applyTheme(fullPreferences.theme, fullPreferences.highContrast);
    // Apply text size changes
    applyTextSize(fullPreferences.textSize);
    // Apply dyslexia font
    applyDyslexiaFont(fullPreferences.dyslexiaFont);
    // Apply colorblind filter
    applyColorblindFilter(fullPreferences.colorblindFilter);

    // Update backend
    try {
      await fetch(`http://localhost:3000/api/accessibility-settings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPreferences),
      });
      toast.success('Preferences updated');
    } catch {
      toast.error('Failed to update preferences');
    }
  };

  // Preference change handler
  const handlePreferenceChange = (
    category: keyof User['accessibilityPreferences'],
    value: boolean | ColorblindFilter | ThemeMode
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
    if (!user) return;
    const currentSize = user.accessibilityPreferences.textSize;
    const newSize = Math.max(10, Math.min(32, currentSize + increment));
    const newPreferences: User['accessibilityPreferences'] = {
      ...user.accessibilityPreferences,
      textSize: newSize,
    };
    handleUpdatePreferences(newPreferences);
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
    <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">

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
          </div>

          <Separator />

          {/* Screen Magnifier */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Search className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <Label htmlFor="magnifier" className="cursor-pointer">
                    Screen Magnifier
                  </Label>
                  <p className="text-muted-foreground mt-1">
                    Shows a magnified view of content under your cursor (2x zoom)
                  </p>
                </div>
              </div>
              <Switch
                id="magnifier"
                checked={Boolean(magnifierEnabled)}
                onCheckedChange={handleToggleMagnifier}
                aria-label={`${magnifierEnabled ? 'Disable' : 'Enable'} Screen Magnifier`}
              />
            </div>
          </div>

          <Separator />
          
          {/* Accessibility Category Toggles */}
          {preferences.map((pref) => {
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
      </section>

      {/* Active Preferences Badge */}
      {(Object.entries(user?.accessibilityPreferences || {}).some(([key, enabled]) => 
        key !== 'textSize' && key !== 'colorblindFilter' && key !== 'theme' && enabled
      ) || user?.accessibilityPreferences.textSize !== 16 || user?.accessibilityPreferences.colorblindFilter !== 'none' || user?.accessibilityPreferences.theme !== 'light') && (
        <Card className="p-6">
          <p className="mb-4">Your active preferences:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(user?.accessibilityPreferences || {})
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
            {user?.accessibilityPreferences.theme !== 'light' && (
              <Badge variant="secondary" className="px-3 py-1">
                {themeOptions.find(t => t.value === user?.accessibilityPreferences.theme)?.label}
              </Badge>
            )}
            {user?.accessibilityPreferences.textSize !== 16 && (
              <Badge variant="secondary" className="px-3 py-1">
                Text Size: {user?.accessibilityPreferences.textSize}px
              </Badge>
            )}
            {user?.accessibilityPreferences.colorblindFilter !== 'none' && (
              <Badge variant="secondary" className="px-3 py-1">
                {colorblindFilters.find(f => f.value === user?.accessibilityPreferences.colorblindFilter)?.label}
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
        <ul className="space-y-3 text-muted-foreground" role="list">
          <li className="flex items-start gap-3">
            <Undo className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <span className="font-medium text-foreground">Undo Button:</span> Located at the bottom-right of the screen to undo your last action
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
          </li>
        </ul>
      </Card>

      {/* Magnifier Component */}
      <Magnifier isActive={magnifierEnabled} magnification={2} />

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
