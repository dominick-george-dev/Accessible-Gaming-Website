import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from './components/ui'
import React, { useEffect, useState } from 'react'
import './App.css'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { AuthProvider } from './contexts/AuthContext'
import { GameDetailPage } from './pages/GameDetailPage'
import { BrowsePage } from './pages/BrowserPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { Layout } from './components/Layout'
import ProfilePage from './pages/ProfilePage'

// Create placeholder pages for the navigation items
const HomePageComponent = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4">
    <div className="max-w-4xl w-full text-center">
      <h2 className="text-2xl font-bold mb-6">Welcome to AccessPlay</h2>
      <p className="text-muted-foreground mb-4">
        Discover accessible games designed for everyone. Browse our collection of games 
        with detailed accessibility information to find the perfect game for you.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Add featured games or content here */}
      </div>
    </div>
  </div>
);

const FavoritesPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4">
    <div className="max-w-4xl w-full text-center">
      <h2 className="text-2xl font-bold mb-6">My Favorites</h2>
      <p className="text-muted-foreground">
        You haven't added any games to your favorites yet. Start browsing to find games you love!
      </p>
    </div>
  </div>
);

const AccessibilityPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4">
    <div className="max-w-4xl w-full text-center">
      <h2 className="text-2xl font-bold mb-6">Accessibility Statement</h2>
      <p className="text-muted-foreground mb-4">
        AccessPlay is committed to ensuring digital accessibility for people with disabilities. 
        We are continually improving the user experience for everyone.
      </p>
      {/* Add more accessibility information */}
    </div>
  </div>
);

function App() {
  // Example: get userId from localStorage, context, or authentication
  // Replace this with your actual user ID logic
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Example: fetch userId from localStorage or authentication context
    // Replace with your actual logic
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // fallback or redirect to login if not authenticated
      setUserId('1'); // fallback userId for demo
    }
  }, []);

  // Add colorblind filter SVG to document (if not using ColorblindSVGFilters component)
  // useEffect(() => {
  //   const existingSvg = document.querySelector('.colorblind-filters');
  //   if (!existingSvg) {
  //     const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  //     svg.setAttribute('class', 'colorblind-filters');
  //     svg.setAttribute('aria-hidden', 'true');
  //     svg.innerHTML = `
  //       <defs>
  //         <!-- Protanopia (Red-blind) Filter -->
  //         <filter id="protanopia-filter">
  //           <feColorMatrix type="matrix" values="0.567 0.433 0     0 0
  //                                                0.558 0.442 0     0 0
  //                                                0     0.242 0.758 0 0
  //                                                0     0     0     1 0"/>
  //         </filter>
          
  //         <!-- Deuteranopia (Green-blind) Filter -->
  //         <filter id="deuteranopia-filter">
  //           <feColorMatrix type="matrix" values="0.625 0.375 0     0 0
  //                                                0.7   0.3   0     0 0
  //                                                0     0.3   0.7   0 0
  //                                                0     0     0     1 0"/>
  //         </filter>
          
  //         <!-- Tritanopia (Blue-blind) Filter -->
  //         <filter id="tritanopia-filter">
  //           <feColorMatrix type="matrix" values="0.95  0.05  0     0 0
  //                                                0     0.433 0.567 0 0
  //                                                0     0.475 0.525 0 0
  //                                                0     0     0     1 0"/>
  //         </filter>
  //       </defs>
  //     `;
  //     document.body.appendChild(svg);
  //   }
  // }, []);

  return (
    <AuthProvider>
      {/* Only render ColorblindFilter if userId is available */}
      {/* {userId && <ColorblindFilter userId={userId} allowUserChange={true} />} */}

      <AccessibilityProvider>
        <Router>
          <div className="app">
            {/* Live region for screen reader announcements */}
            <div aria-live="polite" aria-atomic="true" className="sr-only" id="live-region" />

            {/* Navigation component will go here once you add it from Figma */}
            <main id="main-content">
              <Routes>
                {/* Routes with Layout wrapper */}
                <Route path="/" element={
                  <Layout>
                    <HomePageComponent />
                  </Layout>
                } />
                <Route path="/home" element={
                  <Layout>
                    <HomePageComponent />
                  </Layout>
                } />
                <Route path="/browserpage" element={
                  <Layout>
                    <BrowsePage />
                  </Layout>
                } />
                <Route path="/games/:id" element={
                  <Layout>
                    <GameDetailPage />
                  </Layout>
                } />
                <Route path="/favorites" element={
                  <Layout>
                    <FavoritesPage />
                  </Layout>
                } />
                <Route path="/accessibility" element={
                  <Layout>
                    <AccessibilityPage />
                  </Layout>
                } />
                <Route path="/profile" element={
                  <Layout>
                    <ProfilePage />
                  </Layout>
                } />
                {/* Authentication pages without Layout (they have their own layout) */}
                <Route 
                  path="/login" 
                  element={
                    <LoginPage />
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <SignupPage />
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