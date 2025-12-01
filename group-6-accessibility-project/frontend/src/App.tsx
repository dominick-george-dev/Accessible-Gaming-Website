// import './App.css'
import './styles/globals.css'
import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'
import { GameDetailPage } from './pages/GameDetailPage'
import ProfilePage from './pages/ProfilePage'
import { BrowsePage } from './pages/BrowserPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { Layout } from './components/Layout'
import { useAuth } from './hooks/useAuth'

const FavoritesPage = () => (
  <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">My Favorites</h2>
      <p className="text-muted-foreground">
        You haven't added any games to your favorites yet. Start browsing to find games you love!
      </p>
    </div>
  </div>
);

const AccessibilityPage = () => (
  <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Accessibility Statement</h2>
      <p className="text-muted-foreground mb-4">
        AccessPlay is committed to ensuring digital accessibility for people with disabilities. 
        We are continually improving the user experience for everyone.
      </p>
      {/* Add more accessibility information */}
    </div>
  </div>
);

// Define a User type for better type safety
interface User {
  id: string | number;
  username: string;
  email: string;
  isAdmin?: boolean;
  isPublisher?: boolean;
  role?: string;
}

function App() {
  const { setLoginState } = useAuth();
  const navigate = useNavigate();  
  const [colorblindMode, setColorblindMode] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // Use User type

  // Fetch colorblind mode for the current user
  const fetchColorblindMode = async (userId: string | number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/accessibility-settings/${userId}`);
      if (response.ok) {
        const settings = await response.json();
        setColorblindMode(settings.colorblindFilter || null);
      } else {
        setColorblindMode(null);
      }
    } catch (error) {
      setColorblindMode(null);
      console.error('Failed to fetch colorblind mode:', error);
    }
  };

  useEffect(() => {
    // On mount, fetch colorblind mode if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Set user for header
      fetchColorblindMode(parsedUser.id);
    } else {
      setUser(null);
      setColorblindMode(null);
    }
  }, []);

  useEffect(() => {
    // Apply colorblind class to <html> (not <body>)
    const html = document.documentElement;
    if (colorblindMode) {
      html.classList.forEach(cls => {
        if (cls.startsWith('colorblind-')) html.classList.remove(cls);
      });
      html.classList.add(`colorblind-${colorblindMode}`);
    } else {
      html.classList.forEach(cls => {
        if (cls.startsWith('colorblind-')) html.classList.remove(cls);
      });
    }
  }, [colorblindMode]);

  // Immediately update accessibility settings after login/signup
  const handleLogin = (userData: User) => {
    setLoginState(true, { 
      username: userData.username, 
      email: userData.email, 
      isAdmin: userData.isAdmin || false, 
      isPublisher: userData.isPublisher || false 
    });
    setUser(userData); // Set user for header
    if (userData.id) {
      fetchColorblindMode(userData.id);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        fetchColorblindMode(parsedUser.id);
      }
    }
  };

  const handleSignup = (userData: User) => {
    setLoginState(true, { 
      username: userData.username, 
      email: userData.email, 
      isAdmin: userData.isAdmin || false, 
      isPublisher: userData.isPublisher || false 
    });
    setUser(userData); // Set user for header
    if (userData.id) {
      fetchColorblindMode(userData.id);
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        fetchColorblindMode(parsedUser.id);
      }
    }
  };

  // Reset accessibility settings and user on logout
  const handleLogout = () => {
    setLoginState(false);
    setUser(null);
    setColorblindMode(null);
    // Optionally clear localStorage if you want to fully reset
    // localStorage.removeItem('user');
  };

  // Navigation functions that preserve redirect path
  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <>
      <Layout user={user} onLogout={handleLogout}>
        <div id="colorblind-root" className={colorblindMode ? `colorblind-${colorblindMode}` : ''}>
          <Routes>
            {/* Routes with Layout wrapper */}
            <Route path="/" element={
              <HomePage />
            } />
            <Route path="/home" element={
              <HomePage />
            } />
            <Route path="/browserpage" element={
              <BrowsePage />
            } />
            <Route path="/games/:id" element={
              <GameDetailPage />
            } />
            <Route path="/favorites" element={
              <FavoritesPage />
            } />
            <Route path="/accessibility" element={
              <AccessibilityPage />
            } />
            <Route path="/profile" element={
              <ProfilePage />
            } />
            {/* Authentication pages without Layout (they have their own layout) */}
            <Route 
              path="/login" 
              element={
                <LoginPage 
                  onLogin={handleLogin}
                  onNavigateToSignup={handleNavigateToSignup}
                />
              } 
            />
            <Route 
              path="/signup" 
              element={
                <SignupPage 
                  onSignup={handleSignup}
                  onNavigateToLogin={handleNavigateToLogin}
                />
              } 
            />
          </Routes>
        </div>
      </Layout>
    </>
  )
}

export default App