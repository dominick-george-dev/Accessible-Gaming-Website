import './App.css'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { GameDetailPage } from './pages/GameDetailPage'
import { BrowsePage } from './pages/BrowserPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { PublisherAnalyticsTab } from './components/PublisherAnalyticsTab'
import { Layout } from './components/Layout'
import { useAuth } from './hooks/useAuth'
import AccessibilityStatementPage from './pages/AccessibilityStatementPage'
import { MakeAccountPublisherPage } from './pages/MakeAccountPublisherPage'
import { PublisherDashboard } from './pages/PublisherDashboard'
import { Toaster } from "./components/ui/sonner";
import { AdminDashboard } from './pages/AdminDashboard'

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

const ProfilePage = () => (
  <div className="px-4 py-4 lg:pr-16 lg:py-6 w-full max-w-full overflow-x-hidden">
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">User Profile</h2>
      <p className="text-muted-foreground">
        Manage your account settings and preferences.
      </p>
    </div>
  </div>
);

function App() {
  const { setLoginState } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (userData: { username: string; email: string; isAdmin?: boolean; isPublisher?: boolean; role?: string, id?: number }) => {
    console.log('User logged in:', userData);
    const processedUserData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'USER',
      isAdmin: userData.role === 'ADMIN',
      isPublisher: userData.role === 'PUBLISHER'
    };

    console.log('Processed user data:', processedUserData);
    setLoginState(true, processedUserData);
  };

  const handleSignup = (userData: { username: string; email: string; isAdmin?: boolean; isPublisher?: boolean; role?: string, id?: number }) => {
    console.log('User signed up:', userData);

    const processedUserData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role || 'USER',
      isAdmin: userData.role === 'ADMIN',
      isPublisher: userData.role === 'PUBLISHER'
    };

    console.log('Processed user data:', processedUserData); // Debug log
    setLoginState(true, processedUserData);
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
      <Toaster />
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
            <AccessibilityStatementPage />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <ProfilePage />
          </Layout>
        } />
        <Route path="/publisherdashboard" element={
          <Layout>
            <PublisherDashboard />
          </Layout>
        } />
        <Route path="/makeaccountpublisher" element={
          <Layout>
            <MakeAccountPublisherPage />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout>
            <AdminDashboard />
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
        <Route
          path="/publisherAnalyticsTab"
          element={<PublisherAnalyticsTab />}
        />
      </Routes>
    </>
  )
}

export default App