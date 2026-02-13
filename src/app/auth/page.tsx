'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const REGISTER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'PERSONAL', label: 'Personal (per session)' },
  { value: 'RESEARCHER', label: 'Researcher (subscription)' },
  { value: 'INSTITUTIONAL', label: 'Institutional' },
];

function AuthPageContent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PERSONAL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, socialLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (searchParams.get('signup') === '1') setIsSignUp(true);
  }, [searchParams]);

  // Gray analysis animation background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();

    // Data points for animation
    const dataPoints: Array<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number }> = [];
    const chartElements: Array<{ x: number; y: number; width: number; height: number; vx: number; opacity: number }> = [];
    const pivotPoints: Array<{ x: number; y: number; radius: number; angle: number; speed: number }> = [];

    // Initialize data points
    for (let i = 0; i < 25; i++) {
      dataPoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    // Initialize chart bars
    for (let i = 0; i < 10; i++) {
      chartElements.push({
        x: (canvas.width / 10) * i + 50,
        y: canvas.height / 2,
        width: 25,
        height: Math.random() * 150 + 30,
        vx: 0.3,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }

    // Initialize pivot points
    for (let i = 0; i < 6; i++) {
      pivotPoints.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 100 + i * 50,
        angle: (Math.PI * 2 * i) / 6,
        speed: 0.008 + i * 0.003,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;

      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(17, 24, 39, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines between data points
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < dataPoints.length; i++) {
        for (let j = i + 1; j < dataPoints.length; j++) {
          const dx = dataPoints[i].x - dataPoints[j].x;
          const dy = dataPoints[i].y - dataPoints[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.globalAlpha = (1 - distance / 120) * 0.3;
            ctx.beginPath();
            ctx.moveTo(dataPoints[i].x, dataPoints[i].y);
            ctx.lineTo(dataPoints[j].x, dataPoints[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Update and draw data points
      dataPoints.forEach((point) => {
        point.x += point.vx;
        point.y += point.vy;

        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

        ctx.fillStyle = `rgba(156, 163, 175, ${point.opacity})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw chart bars
      chartElements.forEach((bar) => {
        bar.x += bar.vx;
        if (bar.x > canvas.width) bar.x = -bar.width;

        const gradient = ctx.createLinearGradient(bar.x, bar.y - bar.height, bar.x, bar.y);
        gradient.addColorStop(0, `rgba(107, 114, 128, ${bar.opacity})`);
        gradient.addColorStop(1, `rgba(75, 85, 99, ${bar.opacity})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(bar.x, bar.y - bar.height, bar.width, bar.height);
      });

      // Update and draw pivot points
      pivotPoints.forEach((pivot) => {
        pivot.angle += pivot.speed;
        const x = pivot.x + Math.cos(pivot.angle) * pivot.radius;
        const y = pivot.y + Math.sin(pivot.angle) * pivot.radius;

        ctx.fillStyle = 'rgba(156, 163, 175, 0.4)';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();

        // Draw line to center
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pivot.x, pivot.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const success = await signup(username, email, password, role);
        if (success) {
          router.push('/');
        } else {
          setError('Username or email already exists');
        }
      } else {
        const success = await login(username, password);
        if (success) {
          router.push('/');
        } else {
          setError('Invalid username or password');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (method: 'email' | 'github' | 'apple') => {
    setLoading(true);
    setError('');
    try {
      // For demo, we'll use a mock email/name
      // In production, this would use OAuth
      const mockEmail = `${method}@example.com`;
      const mockName = method === 'github' ? 'GitHub User' : method === 'apple' ? 'Apple User' : 'Email User';
      const success = await socialLogin(method, mockEmail, mockName, 'PERSONAL');
      if (success) {
        router.push('/');
      } else {
        setError('Social login failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gray-900 overflow-hidden">
      {/* Animated background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />
      
      <Header />
      <main className="pt-16 relative z-10">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600">
                {isSignUp
                  ? 'Sign up to start analyzing your thesis data'
                  : 'Sign in to continue your analysis'}
              </p>
            </div>

            {/* Toggle between Sign In and Sign Up */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !isSignUp
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isSignUp
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 border-2 border-gray-800 hover:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-semibold"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-base">Continue with GitHub</span>
              </button>

              <button
                onClick={() => handleSocialLogin('apple')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black text-white rounded-lg hover:bg-gray-900 border-2 border-black hover:border-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-semibold"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="font-semibold text-base">Continue with Apple</span>
              </button>

              <button
                onClick={() => handleSocialLogin('email')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 border-2 border-blue-600 hover:border-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg font-semibold"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-base">Continue with Email</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or {isSignUp ? 'sign up' : 'sign in'} with details</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account type
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white text-gray-900 placeholder:text-gray-500"
                  >
                    {REGISTER_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-200 bg-white focus:bg-white text-gray-900 placeholder:text-gray-500 text-base"
                    placeholder="Choose a username"
                  />
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-200 bg-white focus:bg-white text-gray-900 placeholder:text-gray-500 text-base"
                    placeholder="your.email@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isSignUp ? 'Password' : 'Username or User ID'}
                </label>
                <input
                  type={isSignUp ? 'password' : 'text'}
                  value={isSignUp ? password : username}
                  onChange={(e) => (isSignUp ? setPassword(e.target.value) : setUsername(e.target.value))}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-200 bg-white focus:bg-white text-gray-900 placeholder:text-gray-500 text-base"
                  placeholder={isSignUp ? 'Create a password' : 'Enter username or user ID'}
                />
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-200 bg-white focus:bg-white text-gray-900 placeholder:text-gray-500 text-base"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {!isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 outline-none transition-all duration-200 bg-white focus:bg-white text-gray-900 placeholder:text-gray-500 text-base"
                    placeholder="Enter your password"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <Header />
          <main className="pt-16 flex items-center justify-center min-h-[50vh]">
            <p className="text-gray-600">Loading…</p>
          </main>
          <Footer />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}

