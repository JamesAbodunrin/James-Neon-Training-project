'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { UserRole } from '@/types';

export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  authMethod: 'email' | 'github' | 'apple' | 'manual';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  socialLogin: (method: 'email' | 'github' | 'apple', email: string, name?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ROLE: UserRole = 'PERSONAL';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem('thesisAnalyzer_user');
    if (!storedUser) return null;
    const parsed = JSON.parse(storedUser);
    return { ...parsed, role: parsed.role ?? DEFAULT_ROLE };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('thesisAnalyzer_users') || '[]');
    const foundUser = users.find(
      (u: { username?: string; userId?: string; password?: string }) =>
        (u.username === username || u.userId === username) && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        userId: foundUser.userId,
        username: foundUser.username ?? foundUser.email?.split('@')[0] ?? 'User',
        email: foundUser.email,
        role: foundUser.role ?? DEFAULT_ROLE,
        authMethod: foundUser.authMethod ?? 'manual',
      };
      setUser(userData);
      localStorage.setItem('thesisAnalyzer_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    role: UserRole = DEFAULT_ROLE
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('thesisAnalyzer_users') || '[]');
    const exists = users.some(
      (u: { username?: string; email?: string }) => u.username === username || u.email === email
    );

    if (exists) return false;

    const userId = generateUserId();
    const newUser = {
      userId,
      username,
      email,
      password,
      role,
      authMethod: 'manual' as const,
    };

    users.push(newUser);
    localStorage.setItem('thesisAnalyzer_users', JSON.stringify(users));

    const userData: User = {
      userId,
      username,
      email,
      role,
      authMethod: 'manual',
    };
    setUser(userData);
    localStorage.setItem('thesisAnalyzer_user', JSON.stringify(userData));
    return true;
  };

  const socialLogin = async (
    method: 'email' | 'github' | 'apple',
    email: string,
    name?: string,
    role: UserRole = DEFAULT_ROLE
  ): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('thesisAnalyzer_users') || '[]');
    let foundUser = users.find(
      (u: { email?: string; authMethod?: string }) => u.email === email && u.authMethod === method
    );

    if (!foundUser) {
      const userId = generateUserId();
      const username = name ?? email.split('@')[0];
      const newUser = { userId, username, email, authMethod: method, role };
      users.push(newUser);
      localStorage.setItem('thesisAnalyzer_users', JSON.stringify(users));
      foundUser = newUser;
    }

    const userData: User = {
      userId: foundUser.userId,
      username: foundUser.username ?? foundUser.email?.split('@')[0],
      email: foundUser.email,
      role: foundUser.role ?? DEFAULT_ROLE,
      authMethod: method,
    };
    setUser(userData);
    localStorage.setItem('thesisAnalyzer_user', JSON.stringify(userData));
    return true;
  };

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
        isAdmin: user?.role === 'ADMIN',
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
