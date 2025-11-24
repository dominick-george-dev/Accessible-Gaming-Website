import './App.css'
import { Routes, Route } from 'react-router-dom'
import { GameDetailPage } from './pages/GameDetailPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { PublisherAnalyticsTab } from './components/PublisherAnalyticsTab'

function App() {
  const handleLogin = (username: string, email: string) => {
    console.log('User logged in:', username, email);
    // Redirect to game details page after successful login
    window.location.href = '/games/1';
  };

  const handleSignup = (username: string, email: string, password: string) => {
    console.log('User signed up:', username, email);
    // Redirect to game details page after successful signup
    window.location.href = '/games/1';
  };

  return (
    <>
      <Routes>
        <Route path="/games/:id" element={<GameDetailPage />} />

        {/* Temperary URL for development. Once dashboard is implemeted this will act as a tab*/}
        <Route path="/publisherAnalyticsTab/:id" element={<PublisherAnalyticsTab />} />

        <Route
          path="/login"
          element={
            <LoginPage 
              onLogin={handleLogin}
              onNavigateToSignup={() => window.location.href = '/signup'}
            />
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            <SignupPage 
              onSignup={handleSignup}
              onNavigateToLogin={() => window.location.href = '/login'}
            />
          } 
        />
      </Routes>
    </>
  )
}

export default App