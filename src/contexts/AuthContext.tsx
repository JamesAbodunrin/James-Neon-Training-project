'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  userId: string;
  username: string;
  email: string;
  authMethod: 'email' | 'github' | 'apple' | 'manual';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  socialLogin: (method: 'email' | 'github' | 'apple', email: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('thesisAnalyzer_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Generate unique user ID
  const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Login with username and password
  const login = async (username: string, password: string): Promise<boolean> => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('thesisAnalyzer_users') || '[]');
    const foundUser = users.find(
      (u: any) => (u.username === username || u.userId === username) && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        userId: foundUser.userId,
        username: foundUser.username,
        email: foundUser.email,
        authMethod: foundUser.authMethod || 'manual',
      };
      setUser(userData);
      localStorage.setItem('thesisAnalyzer_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  // Signup with username, email, and password
  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    // Check if username or email already exists
    const users = JSON.parse(localStorage.getItem('thesisAnalyzer_users') || '[]');
    const exists = users.some((u: any) => u.username === username || u.email === email);

    if (exists) {
      return false;
    }

    // Create new user
    const userId = generateUserId();
    const newUser = {
      userId,
      username,
      email,
      password,
      authMethod: 'manual',
    };

    users.push(newUser);
    localStorage.setItem('thesisAnalyzer_users', JSON.stringify(users));

    const userData: User = {
      userId,
      username,
      email,
      authMethod: 'manual',
    };
    setUser(userData);
    localStorage.setItem('thesisAnalyzer_user', JSON.stringify(userData));
    return true;
  };

  // Social login (Email, GitHub, Apple)
  const socialLogin = async (
    method: 'email' | 'github' | 'apple',
    email: string,
    name?: string
  ): Promise<boolean> => {
    // For demo purposes, we'll simulate social login
    // In production, this would integrate with OAuth providers
    const users = JSON.parse(localStorage.getItem('thesisAnalyzer_users') || '[]');
    let foundUser = users.find((u: any) => u.email === email && u.authMethod === method);

    if (!foundUser) {
      // Create new user for social login
      const userId = generateUserId();
      const username = name || email.split('@')[0];
      const newUser = {
        userId,
        username,
        email,
        authMethod: method,
      };
      users.push(newUser);
      localStorage.setItem('thesisAnalyzer_users', JSON.stringify(users));
      foundUser = newUser;
    }

    const userData: User = {
      userId: foundUser.userId,
      username: foundUser.username,
      email: foundUser.email,
      authMethod: method,
    };
    setUser(userData);
    localStorage.setItem('thesisAnalyzer_user', JSON.stringify(userData));
    return true;
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('thesisAnalyzer_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        socialLogin,
        logout,
        isAuthenticated: !!user,
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

