import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // For local development, bypass Base44 and use mock data
      console.log('Loading app in local development mode...');
      
      // Set mock public settings
      setAppPublicSettings({
        id: appParams.appId || 'local-app',
        public_settings: {
          name: 'SOLACE',
          description: 'Your Sovereign AI Companion'
        }
      });
      
      // Immediately set up guest user
      const guestUser = {
        email: 'justinbretthogan@gmail.com',
        id: 'owner_user_123',
        role: 'owner',
        name: 'Justin Brett Hogan'
      };
      
      setUser(guestUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
      
      console.log('App loaded successfully with guest user');
    } catch (error) {
      console.error('Unexpected error:', error);
      // Even on error, load the app with guest user
      setUser({
        email: 'justinbretthogan@gmail.com',
        id: 'owner_user_123',
        role: 'owner',
        name: 'Justin Brett Hogan'
      });
      setIsAuthenticated(true);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Now check if the user is authenticated
      setIsLoadingAuth(true);
      // const currentUser = await base44.auth.me();
      // Mock user for development/local execution without Base44 login
      const currentUser = {
        email: 'guest@local.test',
        id: 'guest_user_123',
        role: 'user',
        name: 'Guest User'
      };
      
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(true); // Force true even on error
      setUser({ email: 'guest@local.test', id: 'guest', role: 'user' }); // Fallback user
      
      // If user auth fails, it might be an expired token
      /*
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
      */
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (shouldRedirect) {
      // Use the SDK's logout method which handles token cleanup and redirect
      base44.auth.logout(window.location.href);
    } else {
      // Just remove the token without redirect
      base44.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Use the SDK's redirectToLogin method
    base44.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState
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
