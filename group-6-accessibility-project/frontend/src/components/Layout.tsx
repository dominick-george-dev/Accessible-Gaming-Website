import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebar, Header, BottomNav } from './Navigation';
import { Breadcrumbs } from './Breadcrumbs';
import { LoadingBar } from './LoadingBar';
import { UndoButton } from './UndoButton';
import { toast } from 'sonner';
import { addUndoAction, undoManager } from '../utils/undoManager';
import { useAuth } from '../hooks/useAuth';
import { applyTheme, applyTextSize, applyDyslexiaFont, applyColorblindFilter } from '../utils/applyAccessibilitySettings';
import { MessageCircle } from 'lucide-react';
import { AidenChatPanel, CHAT_PANEL_WIDTH } from './AidenChatPanel';

interface LayoutProps {
  children: React.ReactNode;
  selectedGameName?: string;
  selectedPublisherName?: string;
}

export function Layout({ children, selectedGameName, selectedPublisherName }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    // Load sidebar state from localStorage, default to true
    const savedState = localStorage.getItem('isDesktopSidebarOpen');
    return savedState !== null ? JSON.parse(savedState) : true;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [voiceControlsEnabled, setVoiceControlsEnabled] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    role: string;
    isAdmin: boolean;
    isPublisher: boolean;
  } | null>(null);

  const [isAidenOpen, setIsAidenOpen] = useState(false);

  // Ensure only one of sidebar or chat is open at a time
  function handleOpenAiden(open: boolean) {
    if (open) {
      setIsAidenOpen(true);
      setIsDesktopSidebarOpen(false);
      setIsMobileSidebarOpen(false);
    } else {
      setIsAidenOpen(false);
    }
  }
  function handleOpenSidebar(open: boolean) {
    if (open) {
      setIsDesktopSidebarOpen(true);
      setIsAidenOpen(false);
    } else {
      setIsDesktopSidebarOpen(false);
    }
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);
  const { saveRedirectPath } = useAuth();

  // Helper function to get page title for navigation undo
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
      case '/home': return 'Home';
      case '/browserpage': return 'Browse Games';
      case '/favorites': return 'Favorites';
      case '/accessibility': return 'Accessibility';
      case '/profile': return 'Profile';
      case '/admin': return 'Admin Dashboard';
      case '/developer': return 'Developer Dashboard';
      case '/publisher': return 'Publisher Dashboard';
      case '/login': return 'Sign In';
      case '/signup': return 'Sign Up';
      default: 
        if (pathname.startsWith('/games/')) {
          return 'Game Details';
        }
        return 'Page';
    }
  };

  // Track navigation for undo functionality
  useEffect(() => {
    if (previousLocation && previousLocation !== location.pathname) {
      addUndoAction(
        `Navigate to ${getPageTitle(location.pathname)}`,
        () => {
          navigate(previousLocation);
          toast(`Navigated back to ${getPageTitle(previousLocation)}`);
        }
      );
    }
    setPreviousLocation(location.pathname);
  }, [location.pathname, navigate, previousLocation]);  // Check for existing user session on component mount
  useEffect(() => {
    // This is where you would check for existing authentication
    // For now, we'll use localStorage to persist login state
    const savedLoginState = localStorage.getItem('isLoggedIn');
    const savedUserData = localStorage.getItem('userData');
    
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setUser({
            id: userData.id,
            name: userData.username || userData.name || 'User',
            role: userData.role || (userData.isAdmin ? 'admin' : userData.isPublisher ? 'publisher' : 'user'),
            isAdmin: userData.isAdmin || false, 
            isPublisher: userData.isPublisher || false 
          });
          // Apply dyslexia font if enabled in userData
          if (userData.accessibilityPreferences && typeof userData.accessibilityPreferences.dyslexiaFont === 'boolean') {
            applyDyslexiaFont(userData.accessibilityPreferences.dyslexiaFont);
          } else {
            applyDyslexiaFont(false);
          }
        } catch {
          // Handle invalid JSON - set to null since we're not logged in properly
          setUser(null);
          setIsLoggedIn(false);
          applyDyslexiaFont(false);
        }
      }
    } else {
      // Don't set user data if not logged in
      setIsLoggedIn(false);
      setUser(null);
      applyDyslexiaFont(false);
    }
  }, []);
  
  const handleLogin = () => {
    console.log('handleLogin called');
    // Store the current path for redirect after login
    saveRedirectPath(location.pathname);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User saved to localStorage:', localStorage.getItem('user'));
    }
    // Navigate to login page
    navigate('/login');
  };
  const handleLogout = () => {
    console.log('logout of user', JSON.stringify(user));
    setIsLoggedIn(false);
    setUser(null);
    
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    
    // Reset accessibility features to default values
    console.log('Resetting accessibility preferences to defaults...');
    localStorage.setItem('accessibility_preferences', JSON.stringify({
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      colorBlindMode: 'none',
      keyboardNavigation: false
    }));
    localStorage.setItem('font_size', 'normal');
    localStorage.setItem('high_contrast', 'false');
    localStorage.setItem('reduced_motion', 'false');
    localStorage.setItem('screen_reader_mode', 'false');
    localStorage.setItem('color_blind_mode', 'none');
    localStorage.setItem('keyboard_navigation', 'false');
    console.log('Accessibility localStorage values reset to defaults');
    
    // Reset any CSS classes or styles applied to document
    console.log('Removing accessibility CSS classes and styles...');
    document.documentElement.classList.remove('high-contrast', 'large-text', 'reduced-motion');
    document.documentElement.style.fontSize = '';
    console.log('DOM styles reset to defaults');
    
    // Reset dyslexia font
    applyDyslexiaFont(false);
    
    console.log('User logged out - accessibility preferences reset to defaults');
    
    // Navigate to home and force reload to apply changes
    navigate('/');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleToggleSidebar = () => {
    const newState = !isDesktopSidebarOpen;
    const previousState = isDesktopSidebarOpen;
    
    setIsDesktopSidebarOpen(newState);
    localStorage.setItem('isDesktopSidebarOpen', JSON.stringify(newState));
    
    // Add undo action for sidebar toggle
    addUndoAction(
      `${newState ? 'Show' : 'Hide'} sidebar`,
      () => {
        setIsDesktopSidebarOpen(previousState);
        localStorage.setItem('isDesktopSidebarOpen', JSON.stringify(previousState));
        toast(`Sidebar ${previousState ? 'shown' : 'hidden'}`);
      }
    );
  };
  const handleToggleMagnifier = () => {
    const previousState = magnifierEnabled;
    setMagnifierEnabled(!magnifierEnabled);
    
    // Add undo action for magnifier
    addUndoAction(
      `${!previousState ? 'Enable' : 'Disable'} screen magnifier`,
      () => {
        setMagnifierEnabled(previousState);
        toast(`Screen magnifier ${previousState ? 'enabled' : 'disabled'}`);
      }
    );
    
    toast(`Screen magnifier ${!previousState ? 'enabled' : 'disabled'}`);
  };

  const handleToggleVoiceControls = () => {
    const previousState = voiceControlsEnabled;
    setVoiceControlsEnabled(!voiceControlsEnabled);
    
    // Add undo action for voice controls
    addUndoAction(
      `${!previousState ? 'Enable' : 'Disable'} voice controls`,
      () => {
        setVoiceControlsEnabled(previousState);
        toast(`Voice controls ${previousState ? 'enabled' : 'disabled'}`);
      }
    );      toast(`Voice controls ${!previousState ? 'enabled' : 'disabled'}`);
  };

  const handleUndo = () => {
    if (undoManager && typeof undoManager.executeUndo === 'function') {
      undoManager.executeUndo();
    } else {
      console.warn('Undo functionality not available');
    }
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden main-app-container">      
      {/* Desktop Sidebar - Conditionally shown */}
      {isDesktopSidebarOpen && (
        <div className="hidden lg:block">
          <Sidebar isLoggedIn={isLoggedIn} />
        </div>
      )}

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar
        isLoggedIn={isLoggedIn}
        isAdmin={user?.isAdmin || false}
        isPublisher={user?.isPublisher || false}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}      
      />
      
      {/* Main Layout with content shrinking behavior */}
      <div 
        className={`w-full max-w-full overflow-x-hidden main-content-wrapper content-shrink-transition ${
          isDesktopSidebarOpen ? 'shrunk-content' : ''
        }`}
      >        
        {/* Top Header */}        
        <Header
          selectedGameName={selectedGameName}
          selectedPublisherName={selectedPublisherName}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onToggleSidebar={() => handleOpenSidebar(!isDesktopSidebarOpen)}
          isSidebarOpen={isDesktopSidebarOpen}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onToggleMagnifier={handleToggleMagnifier}
          magnifierEnabled={magnifierEnabled}
          user={user}
          onUndo={handleUndo}
        />

        {/* Dynamic Loading Bar */}
        <LoadingBar />        
        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          selectedGameName={selectedGameName}
          selectedPublisherName={selectedPublisherName}
          isSidebarOpen={isDesktopSidebarOpen}
        />

        {/* Main Content */}        
        <main 
          id="main-content" 
          className={`content-with-bottom-nav w-full max-w-full overflow-x-hidden transition-all duration-300 ${
            isDesktopSidebarOpen ? 'lg:pl-52' : 'lg:pl-4'
          }`}
          style={{ paddingTop: 'calc(4rem + 3rem)' }} /* Header + Breadcrumbs + spacing */
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Bottom Navigation - Only shown on mobile */}
        <div className="lg:hidden">
          <BottomNav />        
        </div>

        {/* Undo Button */}
        <UndoButton />

        {/* Chat Bot Button (bottom right, large, circular, colorful) */}
        {!isAidenOpen && (
          <button
            onClick={() => handleOpenAiden(true)}
            aria-label="Open Aiden chat bot"
            className="fixed bottom-8 right-8 z-50 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl flex items-center justify-center hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <MessageCircle className="w-12 h-12 text-white drop-shadow-lg" />
          </button>
        )}
        {/* Chat Bot Panel (reuse AidenChatPanel if present) */}
        <AidenChatPanel 
          open={isAidenOpen} 
          onOpenChange={handleOpenAiden} 
          onWakeWord={() => {
            handleOpenAiden(true);
          }}
        />
      </div>
    </div>
  );
}
