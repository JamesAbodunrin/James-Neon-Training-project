'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import {
  isApiEnabled,
  apiGetPricing,
  apiPutPricing,
  apiGetTools,
  apiPutTools,
  apiGetRevenue,
  apiGetAdminUsers,
  type AdminUserItem,
} from '@/lib/api';

const STORAGE_PRICING = 'thesisAnalyzer_adminPricing';
const STORAGE_TOOLS = 'thesisAnalyzer_adminTools';

const DEFAULT_PRICING = [
  { tier: 'Personal (per session)', price: '9.99', currency: 'USD' },
  { tier: 'Researcher (monthly)', price: '29.99', currency: 'USD' },
  { tier: 'Institutional (per seat)', price: '199.00', currency: 'USD' },
];

const DEFAULT_TOOLS = [
  { id: 'statistical', name: 'Statistical Analysis', enabled: true },
  { id: 'regression', name: 'Regression Analysis', enabled: true },
  { id: 'correlation', name: 'Correlation Analysis', enabled: true },
  { id: 'clustering', name: 'Clustering Analysis', enabled: true },
  { id: 'time-series', name: 'Time Series Analysis', enabled: true },
  { id: 'text-analysis', name: 'Text Analysis', enabled: true },
];

function loadPricing(): { tier: string; price: string; currency: string }[] {
  if (typeof window === 'undefined') return DEFAULT_PRICING;
  try {
    const s = localStorage.getItem(STORAGE_PRICING);
    if (s) return JSON.parse(s);
  } catch {
    // ignore
  }
  return DEFAULT_PRICING;
}

function loadTools(): { id: string; name: string; enabled: boolean }[] {
  if (typeof window === 'undefined') return DEFAULT_TOOLS;
  try {
    const s = localStorage.getItem(STORAGE_TOOLS);
    if (s) return JSON.parse(s);
  } catch {
    // ignore
  }
  return DEFAULT_TOOLS;
}

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();
  const [pricing, setPricing] = useState(() => loadPricing());
  const [tools, setTools] = useState(() => loadTools());
  const [pricingToast, setPricingToast] = useState(false);
  const [toolsToast, setToolsToast] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<{ totalRevenue: string; sessionsCount: number; activeSubscriptions: number } | null>(null);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated || !isAdmin) {
      router.replace('/auth');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    if (isApiEnabled()) {
      const tid = requestAnimationFrame(() => {
        setDataError(null);
        setDataLoading(true);
      });
      Promise.all([apiGetPricing(), apiGetTools(), apiGetRevenue(), apiGetAdminUsers()])
        .then(([pricingRes, toolsRes, revenueRes, usersRes]) => {
          if (Array.isArray(pricingRes) && pricingRes.length > 0) setPricing(pricingRes);
          if (Array.isArray(toolsRes) && toolsRes.length > 0) setTools(toolsRes);
          if (revenueRes && typeof revenueRes === 'object') setRevenueMetrics(revenueRes);
          if (Array.isArray(usersRes)) setUsersList(usersRes);
        })
        .catch((err: unknown) => {
          setDataError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        })
        .finally(() => setDataLoading(false));
      return () => cancelAnimationFrame(tid);
    } else {
      const t = setTimeout(() => {
        setRevenueMetrics({
          totalRevenue: '2,450.00',
          sessionsCount: 156,
          activeSubscriptions: 23,
        });
        setDataLoading(false);
        setDataError(null);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [isAdmin]);

  const handleSavePricing = async () => {
    if (isApiEnabled()) {
      try {
        const updated = await apiPutPricing(pricing);
        if (Array.isArray(updated)) setPricing(updated);
        setPricingToast(true);
      } catch {
        setDataError('Failed to save pricing');
      }
    } else {
      localStorage.setItem(STORAGE_PRICING, JSON.stringify(pricing));
      setPricingToast(true);
    }
    setTimeout(() => setPricingToast(false), 3000);
  };

  const handleToggleTool = (id: string) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
  };

  const handleSaveTools = async () => {
    if (isApiEnabled()) {
      try {
        const updated = await apiPutTools(tools);
        if (Array.isArray(updated)) setTools(updated);
        setToolsToast(true);
      } catch {
        setDataError('Failed to save tools');
      }
    } else {
      localStorage.setItem(STORAGE_TOOLS, JSON.stringify(tools));
      setToolsToast(true);
    }
    setTimeout(() => setToolsToast(false), 3000);
  };

  if (typeof window !== 'undefined' && (!user || user.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Configure pricing, tools, view revenue. Admin only. (Source of truth: PRD §H, SRS FR-018–FR-020.)
          </p>

          {dataError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-medium" role="alert">
              {dataError}
            </div>
          )}
          {dataLoading && isApiEnabled() && (
            <p className="mb-6 text-gray-500">Loading dashboard data…</p>
          )}
          {pricingToast && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium" role="status">
              Pricing configuration saved. New pricing applied.
            </div>
          )}
          {toolsToast && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium" role="status">
              Tool activation saved. Configuration applied.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FR-018: Pricing configuration */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing configuration</h2>
              <p className="text-gray-600 text-sm mb-4">Configure pricing tiers. Saved configuration is applied (stored locally).</p>
              <div className="space-y-3 mb-4">
                {pricing.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={row.tier}
                      onChange={(e) =>
                        setPricing((prev) => {
                          const next = [...prev];
                          next[i] = { ...next[i], tier: e.target.value };
                          return next;
                        })
                      }
                      className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Tier name"
                    />
                    <input
                      type="text"
                      value={row.price}
                      onChange={(e) =>
                        setPricing((prev) => {
                          const next = [...prev];
                          next[i] = { ...next[i], price: e.target.value };
                          return next;
                        })
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      placeholder="Price"
                    />
                    <span className="text-gray-600 text-sm">{row.currency}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSavePricing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Configuration
              </button>
            </div>

            {/* FR-019: Tool activation control */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tool activation</h2>
              <p className="text-gray-600 text-sm mb-4">Toggle statistical tools ON/OFF. Disabled tools appear disabled to users.</p>
              <ul className="space-y-2 mb-4">
                {tools.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4">
                    <span className={t.enabled ? 'text-gray-900' : 'text-gray-500'}>{t.name}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={t.enabled}
                      onClick={() => handleToggleTool(t.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${t.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${t.enabled ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleSaveTools}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>

          {/* Users: active and inactive with email */}
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Users</h2>
            <p className="text-gray-600 text-sm mb-4">Active and inactive users with email.</p>
            {usersList.length === 0 && !dataLoading ? (
              <p className="text-gray-500">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usersList.map((u) => (
                      <tr key={u.id} className={u.status === 'ACTIVE' ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm text-gray-900">{u.email ?? '—'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.username}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{u.role}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FR-020: Usage & revenue monitoring */}
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Usage & revenue monitoring</h2>
            <p className="text-gray-600 text-sm mb-4">Revenue and usage statistics.</p>
            {dataLoading && isApiEnabled() ? (
              <p className="text-gray-500">Loading revenue metrics…</p>
            ) : revenueMetrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Total revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${revenueMetrics.totalRevenue}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Sessions (all time)</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueMetrics.sessionsCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600">Active subscriptions</p>
                  <p className="text-2xl font-bold text-gray-900">{revenueMetrics.activeSubscriptions}</p>
                </div>
              </div>
            ) : null}
          </div>

          {/* PRD §H: Institutional license management (placeholder) */}
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Institutional license management</h2>
            <p className="text-gray-600 text-sm mb-4">Manage institutions, seat limits, and seat allocation. Requires backend.</p>
            <p className="text-sm text-gray-500">Configure institutions and assign seats when API and database are connected.</p>
          </div>

          {/* PRD §H: User activity logs (placeholder) */}
          <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">User activity logs</h2>
            <p className="text-gray-600 text-sm mb-4">View audit logs (logins, analysis runs, sandbox events). No raw dataset contents. Requires backend.</p>
            <p className="text-sm text-gray-500">Activity logs will be available when audit logging is connected.</p>
          </div>

          <div className="mt-8">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
