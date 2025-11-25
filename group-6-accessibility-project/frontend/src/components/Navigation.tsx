import { 
  Home, 
  Search, 
  Heart, 
  User, 
  AlertCircle, 
  Shield, 
  BarChart3, 
  Code,
  Menu,
  Mic,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isLoggedIn: boolean;
  collapsed?: boolean;
}

interface MobileSidebarProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPublisher: boolean;
  isOpen: boolean;
  onClose: () => void;
}

interface HeaderProps {
  selectedGameName?: string;
  selectedPublisherName?: string;
  onOpenMobileMenu: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onToggleMagnifier: () => void;
  magnifierEnabled: boolean;
  onToggleVoiceControls?: () => void;
  voiceControlsEnabled?: boolean;
  user?: {
    name: string;
    role: string;
    isAdmin: boolean;
    isPublisher: boolean;
  } | null;
}

export function Sidebar({ isLoggedIn, collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Base navigation items (always shown)
  const baseNavItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'browse', icon: Search, label: 'Browse Games', path: '/browserpage' },
    { id: 'favorites', icon: Heart, label: 'My Favorites', path: '/favorites' },
    { id: 'accessibility', icon: AlertCircle, label: 'Accessibility', path: '/accessibility' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  // Admin/Publisher items (shown at bottom when logged in)
  const adminNavItems = isLoggedIn ? [
    { id: 'admin', icon: Shield, label: 'Admin Dashboard', path: '/admin' },
    { id: 'publisher', icon: BarChart3, label: 'Publisher Dashboard', path: '/publisher' },
  ] : [];

  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname === '/browserpage') return 'browse';
    if (pathname === '/favorites') return 'favorites';
    if (pathname === '/accessibility') return 'accessibility';
    if (pathname === '/profile') return 'profile';
    if (pathname === '/admin') return 'admin';
    if (pathname === '/developer') return 'developer';
    if (pathname === '/publisher') return 'publisher';
    return '';
  };

  const currentPage = getCurrentPage();
  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-card border-r flex flex-col z-60 hidden lg:flex sidebar-above-header sidebar-transition ${
        collapsed ? 'w-16' : 'w-48'
      }`}
      aria-label="Main navigation"
    >
      {/* Logo Section */}
      <div className={`py-4 flex items-center ${collapsed ? 'justify-center px-4' : 'gap-2 pl-4 pr-0'}`}>
        <div
          className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5 text-primary-foreground"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && <h2 className="text-lg font-semibold">AccessPlay</h2>}
      </div>      <Separator />

      {/* Main Navigation */}
      <nav className={`flex-1 py-3 space-y-1 ${collapsed ? 'px-2' : 'pl-3 pr-0'}`}>
        {baseNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={`${collapsed ? 'w-12 h-10 p-0 justify-center' : 'w-full justify-start gap-2 h-9 px-3'} text-sm`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Admin/Publisher Navigation - Bottom Section */}
      {adminNavItems.length > 0 && (
        <>
          <Separator />
          <nav className={`py-3 space-y-1 ${collapsed ? 'px-2' : 'pl-3 pr-0'}`}>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`${collapsed ? 'w-12 h-10 p-0 justify-center' : 'w-full justify-start gap-2 h-9 px-3'} text-sm`}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </>
      )}

      <Separator />

      {/* Footer Info */}
      {!collapsed && (
        <div className="py-3 pl-3 pr-0 text-muted-foreground">
          <p className="text-xs">Discover accessible games for everyone</p>
        </div>
      )}
    </aside>
  );
}

export function MobileSidebar({ 
  isLoggedIn, 
  isAdmin, 
  isPublisher, 
  isOpen, 
  onClose 
}: MobileSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Base navigation items (always shown)
  const baseNavItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'browse', icon: Search, label: 'Browse Games', path: '/browserpage' },
    { id: 'favorites', icon: Heart, label: 'My Favorites', path: '/favorites' },
    { id: 'accessibility', icon: AlertCircle, label: 'Accessibility', path: '/accessibility' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  // Admin/Publisher items (shown at bottom when logged in and user has appropriate role)
  const adminNavItems = [];
  if (isLoggedIn && isAdmin) {
    adminNavItems.push(
      { id: 'admin', icon: Shield, label: 'Admin Dashboard', path: '/admin' },
      { id: 'developer', icon: Code, label: 'Developer Dashboard', path: '/developer' }
    );
  }
  if (isLoggedIn && isPublisher) {
    adminNavItems.push(
      { id: 'publisher', icon: BarChart3, label: 'Publisher Dashboard', path: '/publisher' }
    );
  }

  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname === '/browserpage') return 'browse';
    if (pathname === '/favorites') return 'favorites';
    if (pathname === '/accessibility') return 'accessibility';
    if (pathname === '/profile') return 'profile';
    if (pathname === '/admin') return 'admin';
    if (pathname === '/developer') return 'developer';
    if (pathname === '/publisher') return 'publisher';
    return '';
  };

  const currentPage = getCurrentPage();

  // Handle navigation and close drawer
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose(); // Close the drawer after navigation
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-48 p-0">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6 text-primary-foreground"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <SheetTitle className="text-xl font-semibold">AccessPlay</SheetTitle>
            </div>
          </SheetHeader>          <Separator />

          {/* Main Navigation */}
          <div className="flex-1 flex flex-col">
            <nav className="p-4 space-y-2" aria-label="Main navigation">
              {baseNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => handleNavigate(item.path)}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Admin/Publisher Navigation - Bottom Section */}
            {adminNavItems.length > 0 && (
              <>
                <Separator />
                <nav className="p-4 space-y-2">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;

                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                        onClick={() => handleNavigate(item.path)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Button>
                    );
                  })}
                </nav>
              </>
            )}
          </div>

          <Separator />

          {/* Footer Info */}
          <div className="p-4 text-muted-foreground">
            <p className="text-sm">Discover accessible games for everyone</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Header({
  selectedGameName,
  selectedPublisherName,
  onOpenMobileMenu,
  onToggleSidebar,
  isSidebarOpen = true,
  isLoggedIn,
  onLogin,
  onLogout,
  onToggleMagnifier,
  magnifierEnabled,
  onToggleVoiceControls,
  voiceControlsEnabled = false,
  user
}: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the page title based on current location
  const getPageTitle = () => {
    const pathname = location.pathname;
    
    switch (pathname) {
      case '/':
      case '/home': return 'Discover Accessible Games';
      case '/browserpage': return 'Browse Games';
      case '/favorites': return 'My Favorites';
      case '/accessibility': return 'Accessibility Statement';
      case '/profile': return 'Profile';
      case '/admin': return 'Admin Dashboard';
      case '/developer': return 'Developer Dashboard';
      case '/publisher': return 'Publisher Dashboard';      case '/login': return 'Log In';
      case '/signup': return 'Sign Up';
      default: 
        if (pathname.startsWith('/games/')) {
          return selectedGameName || 'Game Details';
        }
        if (pathname.includes('publisher')) {
          return selectedPublisherName || 'Publisher Profile';
        }
        return 'AccessPlay';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 navbar-header">
      {/* Background that extends full viewport width */}
      <div className="w-full h-full bg-card border-b navbar-header-bg">        <div className={`w-full h-full px-4 lg:px-6 flex items-center justify-between gap-3 relative z-20 max-w-full overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'lg:pl-52' : 'lg:pl-20'
        }`}>
          {/* Menu Button & Logo - Always visible */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                // On mobile, open the mobile sidebar
                // On desktop, toggle the desktop sidebar
                if (window.innerWidth < 1024) {
                  onOpenMobileMenu();
                } else {
                  onToggleSidebar?.();
                }
              }}
              aria-label="Toggle navigation menu"
              className="flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Clickable AccessPlay Logo/Title */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              aria-label="Go to AccessPlay home page"
              className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-lg transition-colors"
            >
              <div
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 text-primary-foreground"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">
                AccessPlay
              </span>
            </Button>
          </div>          {/* Page Title */}
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-base lg:text-lg font-semibold truncate">{getPageTitle()}</h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 lg:gap-4 relative z-30 navbar-header-actions flex-shrink-0">
            {/* Voice Controls Toggle Button */}
            <Button
              variant={voiceControlsEnabled ? 'default' : 'outline'}
              size="icon"
              onClick={onToggleVoiceControls}
              aria-label={voiceControlsEnabled ? 'Disable voice controls' : 'Enable voice controls'}
              aria-pressed={voiceControlsEnabled}
              className="relative z-30"
            >
              <Mic className="w-5 h-5" />
              {voiceControlsEnabled && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              )}
            </Button>            {/* Magnifier Toggle Button */}
            <Button
              variant={magnifierEnabled ? 'default' : 'outline'}
              size="icon"
              onClick={onToggleMagnifier}
              aria-label={magnifierEnabled ? 'Disable screen magnifier' : 'Enable screen magnifier'}
              aria-pressed={magnifierEnabled}
              className="relative z-30"
            >
              <div className="relative w-5 h-5">
                <Search className="w-5 h-5" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="w-2.5 h-2.5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              {magnifierEnabled && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              )}
            </Button>            {/* Login/User Dropdown Button (Hidden on mobile) */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hidden md:flex items-center gap-3 relative z-30 px-3 py-2 h-10 hover:bg-accent/80 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="truncate max-w-24 text-sm font-medium">{user?.name || 'User'}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-24">
                        {user?.role || (user?.isAdmin ? 'Admin' : user?.isPublisher ? 'Publisher' : 'Member')}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="font-semibold leading-none truncate">{user?.name || 'User'}</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {user?.role || (user?.isAdmin ? 'Administrator' : user?.isPublisher ? 'Publisher' : 'Member')}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={onLogout} 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-md p-3"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>) : (
              <Button 
                onClick={onLogin}
                size="sm"
                className="hidden md:flex relative z-30"
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items for bottom nav (simplified for mobile)
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'browse', icon: Search, label: 'Browse', path: '/browserpage' },
    { id: 'favorites', icon: Heart, label: 'Favorites', path: '/favorites' },
    { id: 'accessibility', icon: AlertCircle, label: 'Accessibility', path: '/accessibility' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const getCurrentPage = () => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname === '/home') return 'home';
    if (pathname === '/browserpage') return 'browse';
    if (pathname === '/favorites') return 'favorites';
    if (pathname === '/accessibility') return 'accessibility';
    if (pathname === '/profile') return 'profile';
    return '';
  };

  const currentPage = getCurrentPage();

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              onKeyDown={(e) => handleKeyDown(e, item.path)}
              className={`flex flex-col items-center justify-center gap-1 p-2 flex-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
