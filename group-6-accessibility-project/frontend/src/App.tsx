import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage, ProfilePageWrapper } from './pages'
import { Toaster } from './components/ui'
import React from 'react'
import './App.css'
import { GameDetailPage } from './pages/GameDetailPage'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { AuthProvider } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

function App() {
  // Add colorblind filter SVG to document
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
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <Router>
          <div className="app">
            {/* Live region for screen reader announcements */}
            <div aria-live="polite" aria-atomic="true" className="sr-only" id="live-region" />
          
            {/* Skip link for accessibility */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>

            {/* Navigation component will go here once you add it from Figma */}
            <main id="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePageWrapper />} />
                <Route path="/games/:id" element={<GameDetailPage />} />
                  <Route 
                  path="/login" 
                  element={
                    <LoginPage 
                      onNavigateToSignup={() => window.location.href = '/signup'}
                    />
                  } 
                />
                
                <Route 
                  path="/signup" 
                  element={
                    <SignupPage 
                      onNavigateToLogin={() => window.location.href = '/login'}
                    />
                  } 
                />
              </Routes>
            </main>
            {/* Footer component will go here once you add it from Figma */}
            <Toaster />
          </div>
        </Router>    
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App