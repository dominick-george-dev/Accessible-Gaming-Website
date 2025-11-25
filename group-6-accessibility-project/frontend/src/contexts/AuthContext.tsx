import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (username: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:3000';

// Helper function to store auth data in localStorage
const storeAuthData = (user: User, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
  localStorage.setItem('access_token', token); // Store both names for compatibility
};

// Helper function to clear auth data from localStorage
const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('access_token'); // Clear both token names
};

// Helper function to get stored auth data
const getStoredAuthData = (): { user: User | null; token: string | null } => {
  try {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token') || localStorage.getItem('access_token'); // Check both token names
    
    if (userStr && token) {
      const user = JSON.parse(userStr);
      return { user, token };
    }
  } catch (error) {
    console.error('Error parsing stored auth data:', error);
    clearAuthData();
  }
  return { user: null, token: null };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false,
  });
  // Check for stored authentication on app load
  useEffect(() => {
    console.log('AuthProvider: Checking for stored auth data...');
    const { user, token } = getStoredAuthData();
    
    console.log('AuthProvider: Found stored data:', { user: user?.username, hasToken: !!token });
    
    if (user && token) {
      // Validate token by making a test request
      validateToken(user, token);
    } else {
      console.log('AuthProvider: No stored auth data found');
      setAuthState({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  }, []);
  const validateToken = async (user: User, token: string) => {
    console.log('AuthProvider: Validating token for user:', user.username);
    try {
      // Test the token by making a request to a protected endpoint
      const response = await fetch(`${API_BASE_URL}/user-accessibility-settings/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('AuthProvider: Token validation response status:', response.status);

      if (response.ok) {
        // Token is valid
        console.log('AuthProvider: Token is valid, setting authenticated state');
        setAuthState({
          user,
          token,
          loading: false,
          isAuthenticated: true,
        });
      } else {
        // Token is invalid
        console.log('AuthProvider: Token is invalid, clearing auth data');
        clearAuthData();
        setAuthState({
          user: null,
          token: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('AuthProvider: Token validation failed:', error);
      clearAuthData();
      setAuthState({
        user: null,
        token: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const { user, access_token: token } = data;

      storeAuthData(user, token);
      setAuthState({
        user,
        token,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      const { user, access_token: token } = data;

      storeAuthData(user, token);
      setAuthState({
        user,
        token,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  const logout = () => {
    clearAuthData();
    setAuthState({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
    });
    
    // Force a page refresh to ensure all components update
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider 
      value={{
        ...authState,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
