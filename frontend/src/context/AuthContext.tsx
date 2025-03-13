import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';
import { User, decodeToken } from './authUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authApi.login(email, password);
      localStorage.setItem('token', response.token);
      
      const decodedUser = decodeToken(response.token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        throw new Error('Invalid token received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      await authApi.signup(name, email, password);
      // After successful signup, log the user in
      await login(email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setError(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
        signup,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};