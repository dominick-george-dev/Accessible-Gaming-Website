import { Home, Search, Heart, User, AlertCircle, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

interface MobileSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ currentPage, onNavigate, isLoggedIn, isAdmin, isOpen, onClose }: MobileSidebarProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'browse', icon: Search, label: 'Browse Games' },
    { id: 'favorites', icon: Heart, label: 'My Favorites' },
    { id: 'accessibility', icon: AlertCircle, label: 'Accessibility' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const adminItem = { id: 'admin', icon: Shield, label: 'Admin Dashboard' };

  const handleNavigate = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
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
              <SheetTitle>AccessPlay</SheetTitle>
            </div>
          </SheetHeader>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3"
                  onClick={() => handleNavigate(item.id)}
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
                  onClick={() => handleNavigate(adminItem.id)}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
