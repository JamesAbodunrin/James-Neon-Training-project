'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isApiEnabled, apiGetPricingPublic, apiGetSubscriptionStatus, type PricingItem } from '@/lib/api';

const FALLBACK: PricingItem[] = [
  { tier: 'Personal (per session)', price: '9.99', currency: 'USD' },
  { tier: 'Researcher (monthly)', price: '29.99', currency: 'USD' },
  { tier: 'Institutional (per seat)', price: '199.00', currency: 'USD' },
];

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingItem[]>(FALLBACK);
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuthenticated) {
      router.replace('/auth');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isApiEnabled()) {
      apiGetPricingPublic().then((list) => {
        if (Array.isArray(list) && list.length > 0) setPricing(list);
      });
    }
  }, []);

  useEffect(() => {
    if (isApiEnabled() && isAuthenticated) {
      apiGetSubscriptionStatus().then((status) => {
        if (status?.currentPlan?.planName) setCurrentPlanName(status.currentPlan.planName);
      });
    }
  }, [isAuthenticated]);

  if (typeof window !== 'undefined' && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Central workspace: entry to analysis, history, and billing.
          </p>

          {/* User's current plan */}
          <div className="mb-8 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-600 mb-1">Your plan</h2>
            <p className="text-lg font-semibold text-gray-900">
              {currentPlanName ?? 'No plan selected — choose a plan below to get started.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <Link
              href="/analysis"
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">New Analysis</h2>
              <p className="text-gray-600 text-sm">Upload dataset and run predefined or advanced analysis.</p>
            </Link>
            <Link
              href="/history"
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">History</h2>
              <p className="text-gray-600 text-sm">View past analysis snapshots and re-download reports.</p>
            </Link>
            <Link
              href="/subscription"
              className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-200 transition-all"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Subscription</h2>
              <p className="text-gray-600 text-sm">View plan status and billing.</p>
            </Link>
          </div>

          {/* Plans & pricing from admin configuration */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Plans & pricing</h2>
            <p className="text-gray-600 text-sm mb-4">
              Current plans and prices (set by admin). Choose a plan or manage your subscription.
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              {pricing.map((tier, i) => (
                <div key={i} className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-medium text-gray-900">{tier.tier}</span>
                  <span className="ml-2 text-blue-600 font-semibold">
                    {tier.currency} {tier.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link
                href="/payment"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Select plan / Pay
              </Link>
              <Link
                href="/pricing"
                className="inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View all plans
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
