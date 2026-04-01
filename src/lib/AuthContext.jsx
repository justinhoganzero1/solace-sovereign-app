import React, { createContext, useState, useContext, useEffect } from 'react';
import { localClient } from '@/lib/localClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoadingAuth(true);
      const currentUser = await localClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      console.log('SOLACE loaded with user:', currentUser.email);
    } catch (error) {
      console.error('Error loading user:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = (redirectUrl) => {
    setUser(null);
    setIsAuthenticated(false);
    localClient.auth.logout(redirectUrl);
  };

  const login = async (email, password) => {
    try {
      const user = await localClient.auth.login(email, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      logout,
      login,
      loadUser
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
