import './App.css'
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

function App() {
  const { setLoginState } = useAuth();
  const navigate = useNavigate();  const handleLogin = (userData: { username: string; email: string; isAdmin?: boolean; isPublisher?: boolean; role?: string }) => {
    console.log('User logged in:', userData);
    // Set login state and user data - this will now handle redirect
    setLoginState(true, { 
      username: userData.username, 
      email: userData.email, 
      isAdmin: userData.isAdmin || false, 
      isPublisher: userData.isPublisher || false 
    });
  };

  const handleSignup = (userData: { username: string; email: string; isAdmin?: boolean; isPublisher?: boolean; role?: string }) => {
    console.log('User signed up:', userData);
    // Set login state and user data - this will now handle redirect
    setLoginState(true, { 
      username: userData.username, 
      email: userData.email, 
      isAdmin: userData.isAdmin || false, 
      isPublisher: userData.isPublisher || false 
    });
  };

  // Navigation functions that preserve redirect path
  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <Routes>
      {/* Routes with Layout wrapper */}
      <Route path="/" element={
        <Layout>
          <HomePage />
        </Layout>
      } />
      <Route path="/home" element={
        <Layout>
          <HomePage />
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
  )
}

export default App