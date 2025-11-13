import { Home, Search, Heart, User, AlertCircle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export function Sidebar({ currentPage, onNavigate, isLoggedIn, isAdmin }: SidebarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'browse', icon: Search, label: 'Browse Games' },
    { id: 'favorites', icon: Heart, label: 'My Favorites' },
    { id: 'accessibility', icon: AlertCircle, label: 'Accessibility' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const adminItem = { id: 'admin', icon: Shield, label: 'Admin Dashboard' };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 bg-card border-r flex flex-col"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
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
        <h2>AccessPlay</h2>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => onNavigate(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Button>
          );
        })}

        {/* Admin Navigation - Only show for admin users */}
        {isLoggedIn && isAdmin && (
          <>
            <Separator className="my-4" />
            <Button
              key={adminItem.id}
              variant={currentPage === adminItem.id ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => onNavigate(adminItem.id)}
              aria-label={adminItem.label}
              aria-current={currentPage === adminItem.id ? 'page' : undefined}
            >
              <Shield className="w-5 h-5" aria-hidden="true" />
              <span>{adminItem.label}</span>
            </Button>
          </>
        )}
      </nav>

      <Separator />

      {/* Footer info */}
      <div className="p-4 text-muted-foreground">
        <p>Discover accessible games for everyone</p>
      </div>
    </aside>
  );
}
