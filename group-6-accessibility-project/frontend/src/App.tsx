// import './App.css'
import './styles/globals.css'
// import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'
import { GameDetailPage } from './pages/GameDetailPage'
import ProfilePage from './pages/ProfilePage'
import { BrowsePage } from './pages/BrowserPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { Layout } from './components/Layout'
import { useAuth } from './hooks/useAuth'
import { MyFavoritesPage } from './pages/MyFavoritesPage'
import AccessibilityStatementPage from './pages/AccessibilityStatementPage'
import { MakeAccountPublisherPage } from './pages/MakeAccountPublisherPage'
import { PublisherDashboard } from './pages/PublisherDashboard'
import { Toaster } from "./components/ui/sonner";
import { AdminDashboard } from './pages/AdminDashboard'
import { useEffect } from 'react'

function App() {
  return (
    <AppContent />
  );
}

function AppContent() {
  const { setLoginState } = useAuth();
  const navigate = useNavigate();

  // Handler to update accessibility preferences in the database
  const updatePreferenceHandler = async (userId: number, newPreferences: any) => {
    console.log('updatePreferenceHandler called with:', { userId, newPreferences });
    try {
      const response = await fetch(`http://localhost:3000/api/accessibility-settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });
      console.log('updatePreferenceHandler fetch response:', response);
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      // Optionally handle success (e.g., show a toast)
      // toast.success('Preferences updated');
    } catch (error) {
      // Optionally handle error (e.g., show a toast)
      // toast.error('Failed to update preferences');
      console.error('Error updating preferences:', error);
    }
  };

  useEffect(() => {
    document.title = "Accessplay Gaming";

    const setFavicon = (url: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = url;
    };

    setFavicon('/gamepad.png');
  }, []);

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
            <MyFavoritesPage />
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
        {/* Authentication pages without Layout (they have their own layout) */}        <Route
          path="/login"
          element={
            <div className="login-page">
              <LoginPage
                onLogin={handleLogin}
                onNavigateToSignup={handleNavigateToSignup}
              />
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="signup-page">
              <SignupPage
                onSignup={handleSignup}
                onNavigateToLogin={handleNavigateToLogin}
              />
            </div>
          }
        />
      </Routes>
    </>
  )
}

export default App