import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiFetch } from '@/api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Check if we have a valid token on mount
    const token = localStorage.getItem('cazyno_token');
    if (!token) {
      setIsLoadingAuth(false);
      return;
    }

    apiFetch('/auth/me')
      .then((u) => {
        setUser(u);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('cazyno_token');
      })
      .finally(() => setIsLoadingAuth(false));
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async (redirectUrl) => {
    localStorage.removeItem('cazyno_token');
    setUser(null);
    setIsAuthenticated(false);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  const navigateToLogin = () => {
    // Redirige vers la landing — le AuthModal s'ouvre via les boutons de la landing
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: null,
      login,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
