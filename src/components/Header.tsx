'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  const getUserInitials = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const navLinks = (
    <>
      <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
        Home
      </Link>
      <Link href="/pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
        Pricing
      </Link>
      {isAuthenticated && (
        <>
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/history" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
            History
          </Link>
        </>
      )}
      <Link href="/analysis" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
        Analysis
      </Link>
      <Link href="/projects" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
        Projects
      </Link>
      {isAuthenticated && user?.role === 'ADMIN' && (
        <Link href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo - responsive padding */}
          <div className="pl-0 sm:pl-4 md:pl-8 lg:pl-16 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">T</span>
              </div>
              <span className="text-base sm:text-xl font-bold text-gray-900 truncate max-w-[140px] sm:max-w-none">ThesisAnalyzer</span>
            </Link>
          </div>

          {/* Desktop nav - hidden on small screens */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-4 xl:gap-6">
            {navLinks}
          </nav>

          {/* Right: user / login or hamburger on mobile */}
          <div className="flex items-center gap-2 pl-2 pr-0 sm:pr-4 md:pr-8 lg:pr-16 relative" ref={dropdownRef}>
            {/* Hamburger - visible only on mobile/tablet */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="User menu"
                >
                  {getUserInitials()}
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.username}</p>
                      <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      <p className="text-xs text-gray-600 mt-1 truncate">Role: {user.role} · ID: {user.userId}</p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setShowDropdown(false)}>Dashboard</Link>
                    <Link href="/history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setShowDropdown(false)}>History</Link>
                    <Link href="/projects" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setShowDropdown(false)}>Projects</Link>
                    <button type="button" onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex flex-col p-4 gap-1 [&>a]:block [&>a]:py-3 [&>a]:px-4 [&>a]:rounded-lg [&>a]:hover:bg-gray-100 [&>a]:text-gray-700 [&>a]:hover:text-blue-600">
            {navLinks}
          </nav>
        </div>
      )}
    </header>
  );
}
