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
} from '../components/ui';
import { toast } from 'sonner';
import { Magnifier } from '../components/Magnifier';
import { useAccessibilityContext } from '../contexts/AccessibilityContext';
import { useAuth } from '../contexts/AuthContext';

// ===== TYPES =====

type ColorblindFilter = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
type ThemeMode = 'light' | 'dark';

// ===== MAIN COMPONENT =====

export default function ProfilePage() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);  
  const [userStats, setUserStats] = useState({
    favoritesCount: 0,
    reviewsCount: 0,
    loading: true
  });

  // Simple token check as fallback
  const hasToken = !!(localStorage.getItem('access_token') || localStorage.getItem('token'));
  const storedUser = localStorage.getItem('user');
  
  console.log('ProfilePage: Initial checks:', { hasToken, hasStoredUser: !!storedUser });
  // Debug: Log authentication state changes
  React.useEffect(() => {
    console.log('ProfilePage: Auth state changed:', {
      user: user?.username || null,
      authLoading,
      isAuthenticated,
      hasAccessToken: !!localStorage.getItem('access_token'),
      hasToken: !!localStorage.getItem('token')
    });
  }, [user, authLoading, isAuthenticated]);

  // Note: Removed automatic redirect to /login to allow proper authentication prompt UI
  // Fetch user statistics (favorites and reviews counts)
  const fetchUserStats = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Use the same token logic as the API service
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        console.log('ProfilePage: No token found for user stats');
        return;
      }

      console.log('ProfilePage: Fetching user stats for user:', user.id);

      // Fetch favorites count
      const favoritesResponse = await fetch(`http://localhost:3000/users/${user.id}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch reviews count  
      const reviewsResponse = await fetch(`http://localhost:3000/users/${user.id}/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const favoritesData = favoritesResponse.ok ? await favoritesResponse.json() : [];
      const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : [];

      setUserStats({
        favoritesCount: Array.isArray(favoritesData) ? favoritesData.length : 0,
        reviewsCount: Array.isArray(reviewsData) ? reviewsData.length : 0,
        loading: false
      });

      console.log('ProfilePage: User stats loaded:', {
        favorites: Array.isArray(favoritesData) ? favoritesData.length : 0,
        reviews: Array.isArray(reviewsData) ? reviewsData.length : 0
      });
    } catch (error) {
      console.error('ProfilePage: Failed to fetch user stats:', error);
      setUserStats({
        favoritesCount: 0,
        reviewsCount: 0,
        loading: false
      });
    }
  }, [user?.id]);

  // Fetch user stats when component mounts and user is available
  React.useEffect(() => {
    if (user?.id && !authLoading) {
      fetchUserStats();
    }
  }, [user?.id, authLoading, fetchUserStats]);
  
  // Debug: Track scroll events
  React.useEffect(() => {
    const handleScroll = () => {
      console.log('🔄 Scroll event detected:', window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Backend integration for accessibility settings
  const { settings: backendSettings, updateSettings: updateBackendSettings, loading, saving } = useAccessibilityContext();  // Local preferences state derived from backend settings
  const [localPreferences, setLocalPreferences] = useState({
    visual: false,
    hearing: false,
    dexterity: false,
    cognitive: false,
    textSize: 16,
    highContrast: false,
    dyslexiaFont: false,
    colorblindFilter: 'none' as ColorblindFilter,
    theme: 'light' as ThemeMode,
  });  // Sync backend settings to local preferences when loaded
  React.useEffect(() => {
    if (!loading && backendSettings) {      const mappedTheme = backendSettings.colourMode === 'dark-mode' ? 'dark' : 'light';
      
      setLocalPreferences({
        textSize: backendSettings.textSize,
        highContrast: backendSettings.highContrast,
        dyslexiaFont: backendSettings.fontFamily === 'dyslexic',
        colorblindFilter: backendSettings.colorBlindMode as ColorblindFilter,
        theme: mappedTheme,
        visual: backendSettings.visualAccessibility,
        hearing: backendSettings.hearingAccessibility,
        dexterity: backendSettings.motorDexterityAccessibility,
        cognitive: backendSettings.cognitiveAccessibility,
      });
      setMagnifierEnabled(backendSettings.screenMagnifier);
    }
  }, [backendSettings, loading]);
  // Show loading or redirect if not authenticated
  if (authLoading) {
    console.log('ProfilePage: Showing loading state');
    return (
      <main className="max-w-4xl mx-auto p-4 lg:p-6">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading user authentication...</p>
            </div>
          </div>
        </Card>
      </main>
    );
  }
  // Show authentication required if not authenticated OR no user data OR no token
  if (!isAuthenticated || !user || !hasToken) {
    console.log('ProfilePage: User not authenticated, showing login prompt:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasToken,
      authLoading 
    });
    return (
      <main className="max-w-4xl mx-auto p-4 lg:p-6">
        <Card className="p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You must be logged in to access your profile. Please log in to continue.
            </p>            <div className="space-x-4">
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            </div>
          </div>
        </Card>
      </main>
    );
  }// Preference change handler
  const handlePreferenceChange = async (
    category: keyof typeof localPreferences,
    value: boolean | ColorblindFilter | ThemeMode | number
  ) => {
    console.log('🔧 handlePreferenceChange called:', { category, value, currentScroll: window.scrollY });
    
    if (isUpdating) return;

    // Check if user is still authenticated
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to save settings');
      return;
    }

    setIsUpdating(true);
    
    console.log('📊 Before state update - scroll position:', window.scrollY);
    
    const newPreferences = {
      ...localPreferences,
      [category]: value,
    };
    
    // Update local state immediately for responsive UI
    setLocalPreferences(newPreferences);
    
    // Check scroll position immediately after state update
    setTimeout(() => {
      console.log('📊 After state update (immediate) - scroll position:', window.scrollY);
    }, 0);
    
    // Save to backend
    try {
      console.log('💾 Saving settings to backend...', newPreferences);
      await updateBackendSettings({
        textSize: newPreferences.textSize,
        fontFamily: newPreferences.dyslexiaFont ? 'dyslexic' : 'default',
        highContrast: newPreferences.highContrast,
        colorBlindMode: newPreferences.colorblindFilter,
        colourMode: newPreferences.theme === 'dark' ? 'dark-mode' : 'light-mode',
        visualAccessibility: newPreferences.visual,
        hearingAccessibility: newPreferences.hearing,
        motorDexterityAccessibility: newPreferences.dexterity,
        cognitiveAccessibility: newPreferences.cognitive,
        screenMagnifier: magnifierEnabled,
      });
      console.log('✅ Settings saved successfully');
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      toast.error('Failed to save preferences');
      
      // If saving failed, revert to previous state
      const revertedPreferences = {
        ...localPreferences,
        [category]: localPreferences[category],
      };
      setLocalPreferences(revertedPreferences);
    } finally {
      setIsUpdating(false);
    }
  };

  // Text size adjustment
  const handleTextSizeChange = (increment: number) => {
    const currentSize = localPreferences.textSize;
    const newSize = Math.max(10, Math.min(32, currentSize + increment));
    
    handlePreferenceChange('textSize', newSize);
    
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
  const handleToggleMagnifier = async () => {
    // Check if user is still authenticated
    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to save settings');
      return;
    }

    const newMagnifierState = !magnifierEnabled;
    setMagnifierEnabled(newMagnifierState);
    
    try {
      console.log('🔍 Saving magnifier setting to backend...', newMagnifierState);
      await updateBackendSettings({
        screenMagnifier: newMagnifierState,
      });
      toast.success(newMagnifierState ? 'Magnifier enabled' : 'Magnifier disabled');
      console.log('✅ Magnifier setting saved successfully');
    } catch (error) {
      console.error('❌ Failed to save magnifier setting:', error);
      toast.error('Failed to save magnifier setting');
      setMagnifierEnabled(!newMagnifierState); // Revert on error
    }
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
  ];
  return (
    <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings and accessibility preferences</p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading accessibility settings...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Saving Indicator */}
      {saving && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-center text-blue-700 dark:text-blue-300">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span>Saving accessibility settings...</span>
          </div>
        </Card>
      )}      {/* User Info */}
      <Card className="p-4 lg:p-8">
        <div className="flex items-center gap-4 lg:gap-6">
          <Avatar className="w-16 h-16 lg:w-24 lg:h-24">
            <AvatarFallback className="bg-blue-600 text-white text-xl lg:text-2xl">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl lg:text-2xl font-semibold mb-1 lg:mb-2">{user.username}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
            <div className="mt-2 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Card>{/* User Statistics */}
      <div className="grid grid-cols-2 gap-4 lg:gap-6">
        <Card className="p-4 lg:p-6 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Favourites</div>
          {userStats.loading ? (
            <div className="text-lg lg:text-xl text-gray-400">Loading...</div>
          ) : (
            <div className="text-lg lg:text-xl tabular-nums user-stat">{userStats.favoritesCount}</div>
          )}
        </Card>
        <Card className="p-4 lg:p-6 text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-1 lg:mb-2">Reviews</div>
          {userStats.loading ? (
            <div className="text-lg lg:text-xl text-gray-400">Loading...</div>
          ) : (
            <div className="text-lg lg:text-xl tabular-nums user-stat">{userStats.reviewsCount}</div>
          )}
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
                Current: {localPreferences.textSize}px
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

          <Separator />          {/* Theme Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Moon className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <Label htmlFor="theme-selector">Theme</Label>
            </div>            <div className="ml-10">
              <Select
                value={localPreferences.theme}                onValueChange={(value: string) => {
                  handlePreferenceChange('theme', value as ThemeMode);
                }}
              ><SelectTrigger 
                  className="w-full" 
                  id="theme-selector"
                >
                  <SelectValue placeholder="Select a theme">
                    {themeOptions.find(option => option.value === localPreferences.theme)?.label || 'Select a theme'}
                  </SelectValue>
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
                checked={localPreferences.dyslexiaFont}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('dyslexiaFont', checked)
                }
                aria-label={`${localPreferences.dyslexiaFont ? 'Disable' : 'Enable'} Dyslexia-Friendly Font`}
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
                checked={localPreferences.highContrast}
                onCheckedChange={(checked) =>
                  handlePreferenceChange('highContrast', checked)
                }
                aria-label={`${localPreferences.highContrast ? 'Disable' : 'Enable'} High Contrast Mode`}
              />
            </div>
          </div>

          <Separator />          {/* Colorblind Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Palette className="w-6 h-6 text-blue-600 flex-shrink-0" aria-hidden="true" />
              <Label htmlFor="colorblind-filter">Colorblind Filter</Label>
            </div>            <div className="ml-10">
              <Select
                value={localPreferences.colorblindFilter}
                onValueChange={(value: string) => {
                  handlePreferenceChange('colorblindFilter', value as ColorblindFilter);
                }}
              >
                <SelectTrigger className="w-full" id="colorblind-filter">
                  <SelectValue placeholder="Select a filter">
                    {colorblindFilters.find(filter => filter.value === localPreferences.colorblindFilter)?.label || 'Select a filter'}
                  </SelectValue>
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
            const isEnabled = localPreferences[pref.id as keyof typeof localPreferences] as boolean;
            
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
                      pref.id as keyof typeof localPreferences,
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
      {(Object.entries(localPreferences).some(([key, enabled]) => 
        key !== 'textSize' && key !== 'colorblindFilter' && key !== 'theme' && enabled
      ) || localPreferences.textSize !== 16 || localPreferences.colorblindFilter !== 'none' || localPreferences.theme !== 'light') && (
        <Card className="p-6">
          <p className="mb-4">Your active preferences:</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(localPreferences)
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
            {localPreferences.theme !== 'light' && (
              <Badge variant="secondary" className="px-3 py-1">
                {themeOptions.find(t => t.value === localPreferences.theme)?.label}
              </Badge>
            )}
            {localPreferences.textSize !== 16 && (
              <Badge variant="secondary" className="px-3 py-1">
                Text Size: {localPreferences.textSize}px
              </Badge>
            )}
            {localPreferences.colorblindFilter !== 'none' && (
              <Badge variant="secondary" className="px-3 py-1">
                {colorblindFilters.find(f => f.value === localPreferences.colorblindFilter)?.label}
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
      </Card>      {/* Magnifier Component */}
      <Magnifier isActive={magnifierEnabled} magnification={2} />

      {/* Colorblind Filter SVGs */}
      <ColorblindFilterSVGs />
    </main>
  );
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
