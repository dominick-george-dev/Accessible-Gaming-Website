import { Home, Search, Heart, User, AlertCircle } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'browse', icon: Search, label: 'Browse' },
    { id: 'favorites', icon: Heart, label: 'Favorites' },
    { id: 'accessibility', icon: AlertCircle, label: 'Accessibility' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, page: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-card border-t z-50"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
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
