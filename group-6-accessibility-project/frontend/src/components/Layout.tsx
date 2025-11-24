import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebar, Header, BottomNav } from './Navigation';
import { UndoButton } from './UndoButton';
import { toast } from 'sonner';
import { addUndoAction } from '../utils/undoManager';
import { useAuth } from '../hooks/useAuth';

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
    name: string;
    role: string;
    isAdmin: boolean;
    isPublisher: boolean;
  } | null>(null);

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
            name: userData.username || userData.name || 'User',
            role: userData.role || (userData.isAdmin ? 'admin' : userData.isPublisher ? 'publisher' : 'user'),
            isAdmin: userData.isAdmin || false, 
            isPublisher: userData.isPublisher || false 
          });
        } catch {
          // Handle invalid JSON - set to null since we're not logged in properly
          setUser(null);
          setIsLoggedIn(false);
        }
      }
    } else {
      // Don't set user data if not logged in
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);const handleLogin = () => {
    // Store the current path for redirect after login
    saveRedirectPath(location.pathname);
    
    // Navigate to login page
    navigate('/login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    navigate('/');
  };  const handleToggleSidebar = () => {
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
  };const handleToggleMagnifier = () => {
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
  };const handleToggleVoiceControls = () => {
    const previousState = voiceControlsEnabled;
    setVoiceControlsEnabled(!voiceControlsEnabled);
    
    // Add undo action for voice controls
    addUndoAction(
      `${!previousState ? 'Enable' : 'Disable'} voice controls`,
      () => {
        setVoiceControlsEnabled(previousState);
        toast(`Voice controls ${previousState ? 'enabled' : 'disabled'}`);
      }
    );
    
    toast(`Voice controls ${!previousState ? 'enabled' : 'disabled'}`);
  };return (    <div className="min-h-screen bg-background w-full overflow-x-hidden main-app-container">      {/* Desktop Sidebar - Conditionally shown */}
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
        onClose={() => setIsMobileSidebarOpen(false)}      />{/* Main Layout with content shrinking behavior */}
      <div 
        className={`w-full max-w-full overflow-x-hidden main-content-wrapper content-shrink-transition ${
          isDesktopSidebarOpen ? 'shrunk-content' : ''
        }`}
      >        {/* Top Header */}        <Header
          selectedGameName={selectedGameName}
          selectedPublisherName={selectedPublisherName}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isDesktopSidebarOpen}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onToggleMagnifier={handleToggleMagnifier}
          magnifierEnabled={magnifierEnabled}
          onToggleVoiceControls={handleToggleVoiceControls}
          voiceControlsEnabled={voiceControlsEnabled}
          user={user}
        />{/* Main Content */}
        <main 
          id="main-content" 
          className={`content-with-bottom-nav w-full max-w-full pt-12 overflow-x-hidden transition-all duration-300 ${
            isDesktopSidebarOpen ? 'lg:pl-52' : 'lg:pl-4'
          }`}
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Bottom Navigation - Only shown on mobile */}
        <div className="lg:hidden">
          <BottomNav />        </div>

        {/* Undo Button */}
        <UndoButton />
      </div>
    </div>
  );
}
