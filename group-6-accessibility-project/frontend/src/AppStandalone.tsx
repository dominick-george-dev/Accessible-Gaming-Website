// AppStandalone.tsx - Isolated Figma ProfilePage for Testing
import React from 'react';
import { ProfilePage } from './components/figma/ProfilePage';
import { Toaster } from './components/ui/sonner';
import { Magnifier } from './components/Magnifier';
import './styles/globals.css';

// Standalone app for testing ProfilePage in isolation
const AppStandalone: React.FC = () => {
  const [magnifierEnabled, setMagnifierEnabled] = React.useState(false);

  // Add colorblind filter SVG to document if not present
  React.useEffect(() => {
    const existingSvg = document.querySelector('.colorblind-filters');
    if (!existingSvg) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'colorblind-filters');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = `
        <defs>
          <!-- Protanopia (Red-blind) Filter -->
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567 0.433 0     0 0
                                                 0.558 0.442 0     0 0
                                                 0     0.242 0.758 0 0
                                                 0     0     0     1 0"/>
          </filter>
          
          <!-- Deuteranopia (Green-blind) Filter -->
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625 0.375 0     0 0
                                                 0.7   0.3   0     0 0
                                                 0     0.3   0.7   0 0
                                                 0     0     0     1 0"/>
          </filter>
          
          <!-- Tritanopia (Blue-blind) Filter -->
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95  0.05  0     0 0
                                                 0     0.433 0.567 0 0
                                                 0     0.475 0.525 0 0
                                                 0     0     0     1 0"/>
          </filter>
        </defs>
      `;
      document.body.appendChild(svg);
    }
  }, []);

  // Listen for magnifier toggle from ProfilePage
  React.useEffect(() => {
    const handleMagnifierToggle = (event: CustomEvent<{ enabled: boolean }>) => {
      setMagnifierEnabled(event.detail.enabled);
    };

    document.addEventListener('magnifier-toggle', handleMagnifierToggle as EventListener);
    return () => {
      document.removeEventListener('magnifier-toggle', handleMagnifierToggle as EventListener);
    };
  }, []);

  return (
    <div className="standalone-app min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="live-region" />

      {/* Main content */}
      <main id="main-content" className="w-full">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Figma ProfilePage - Standalone Test
            </h1>
            <p className="text-muted-foreground">
              Testing the ProfilePage component with full accessibility features
            </p>
          </header>

          {/* ProfilePage Component */}
          <div className="w-full max-w-4xl mx-auto">
            <ProfilePage />
          </div>

          {/* Test Instructions */}
          <footer className="mt-16 p-6 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Accessibility Features</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Text size adjustment (10px - 32px)</li>
                  <li>• Theme switching (Light, Dark, Deep Space)</li>
                  <li>• Dyslexia-friendly font toggle</li>
                  <li>• High contrast mode</li>
                  <li>• Colorblind filters (4 types)</li>
                  <li>• Screen magnifier (2x zoom)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Keyboard Navigation</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Tab: Navigate between controls</li>
                  <li>• Space/Enter: Activate buttons/toggles</li>
                  <li>• Arrow keys: Navigate select options</li>
                  <li>• Escape: Close dropdowns</li>
                  <li>• All controls are keyboard accessible</li>
                </ul>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster />

      {/* Screen magnifier */}
      <Magnifier enabled={magnifierEnabled} zoom={2} size={200} />
    </div>
  );
};

export default AppStandalone;
