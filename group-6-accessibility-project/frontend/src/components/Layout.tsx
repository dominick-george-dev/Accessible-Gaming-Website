import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebar, Header, BottomNav } from './Navigation';
import { Breadcrumbs } from './Breadcrumbs';
import { LoadingBar } from './LoadingBar';
import { UndoButton } from './UndoButton';
import { Magnifier } from './Magnifier';
import { toast } from 'sonner';
import { addUndoAction } from '../utils/undoManager';
import { useAuth } from '../contexts/AuthContext';

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

  const [magnifierEnabled, setMagnifierEnabled] = useState(false);
  const [voiceControlsEnabled, setVoiceControlsEnabled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [previousLocation, setPreviousLocation] = useState<string | null>(null);
  
  // Use AuthContext for authentication state
  const { user, isAuthenticated, logout } = useAuth();

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
  }, [location.pathname, navigate, previousLocation]);  // Convert AuthContext user to expected format for Navigation components
  const layoutUser = user ? {
    name: user.username,
    role: 'user', // Default role since AuthContext doesn't include role info
    isAdmin: false, // Would need to be added to AuthContext User interface
    isPublisher: false // Would need to be added to AuthContext User interface
  } : null;

  // Authentication handlers
  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };const handleToggleSidebar = () => {
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
  };  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden main-app-container">
      {/* Desktop Sidebar - Always shown but with collapsed state */}
      <div className="hidden lg:block">
        <Sidebar isLoggedIn={isAuthenticated} collapsed={!isDesktopSidebarOpen} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar
        isLoggedIn={isAuthenticated}
        isAdmin={layoutUser?.isAdmin || false}
        isPublisher={layoutUser?.isPublisher || false}
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
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isDesktopSidebarOpen}
          isLoggedIn={isAuthenticated}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onToggleMagnifier={handleToggleMagnifier}
          magnifierEnabled={magnifierEnabled}
          onToggleVoiceControls={handleToggleVoiceControls}
          voiceControlsEnabled={voiceControlsEnabled}
          user={layoutUser}
        />

        {/* Dynamic Loading Bar */}
        <LoadingBar />        {/* Breadcrumb Navigation */}
        <Breadcrumbs 
          selectedGameName={selectedGameName}
          selectedPublisherName={selectedPublisherName}
          isSidebarOpen={isDesktopSidebarOpen}
        />        {/* Main Content */}        <main 
          id="main-content" 
          className={`content-with-bottom-nav w-full max-w-full overflow-x-hidden transition-all duration-300 ${
            isDesktopSidebarOpen ? 'lg:pl-52' : 'lg:pl-20'
          }`}
          style={{ paddingTop: 'calc(4rem + 3rem)' }} /* Header + Breadcrumbs + spacing */
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Bottom Navigation - Only shown on mobile */}
        <div className="lg:hidden">
          <BottomNav />        </div>        {/* Undo Button */}
        <UndoButton />

        {/* Screen Magnifier */}
        <Magnifier isActive={magnifierEnabled} />
      </div>
    </div>
  );
}
