'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserRole } from '@/types';
import { isApiEnabled, apiLogin as apiLoginFetch, apiRegister as apiRegisterFetch, apiMe, apiClearToken } from '@/lib/api';

export interface User {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  authMethod: 'email' | 'github' | 'apple' | 'manual';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | false>;
  signup: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  socialLogin: (method: 'email' | 'github' | 'apple', email: string, name?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/** Source of truth: admin login credentials (user_id: Admin, password: Admin12345) */
const ADMIN_USER_ID = 'Admin';
const ADMIN_PASSWORD = 'Admin12345';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ROLE: UserRole = 'PERSONAL';

function getStoredUser(): User | null {
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
  // Always start as null so server and first client render match (avoids hydration mismatch).
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isApiEnabled()) {
      const token = localStorage.getItem('thesisAnalyzer_token');
      if (token) {
        let cancelled = false;
        apiMe()
          .then((u) => {
            if (cancelled) return;
            if (u) {
              setUser(u);
              localStorage.setItem('thesisAnalyzer_user', JSON.stringify(u));
            }
          })
          .catch(() => {
            if (cancelled) return;
            apiClearToken();
            localStorage.removeItem('thesisAnalyzer_user');
          });
        return () => { cancelled = true; };
      }
    }
    queueMicrotask(() => setUser(getStoredUser()));
  }, []);

  const generateUserId = (): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const login = async (username: string, password: string): Promise<User | false> => {
    if (isApiEnabled()) {
      const res = await apiLoginFetch(username, password);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('thesisAnalyzer_user', JSON.stringify(res.user));
        return res.user;
      }
      return false;
    }

    if (username === ADMIN_USER_ID && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        userId: ADMIN_USER_ID,
        username: 'Admin',
        email: 'admin@thesisanalyzer.local',
        role: 'ADMIN',
        authMethod: 'manual',
      };
      setUser(adminUser);
      localStorage.setItem('thesisAnalyzer_user', JSON.stringify(adminUser));
      return adminUser;
    }

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
      return userData;
    }
    return false;
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    role: UserRole = DEFAULT_ROLE
  ): Promise<boolean> => {
    if (isApiEnabled()) {
      const res = await apiRegisterFetch(username, email, password, role);
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('thesisAnalyzer_user', JSON.stringify(res.user));
        return true;
      }
      return false;
    }

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
    if (isApiEnabled()) apiClearToken();
    if (typeof window !== 'undefined') window.location.href = '/';
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
