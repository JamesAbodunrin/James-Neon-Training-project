'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isApiEnabled, apiGetPricingPublic, type PricingItem } from '@/lib/api';

const FALLBACK: PricingItem[] = [
  { tier: 'Personal (per session)', price: '9.99', currency: 'USD' },
  { tier: 'Researcher (monthly)', price: '29.99', currency: 'USD' },
  { tier: 'Institutional (per seat)', price: '199.00', currency: 'USD' },
];

export default function SubscriptionPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingItem[]>(FALLBACK);

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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Subscription Management</h1>
          <p className="text-gray-600 mb-8">
            View plan status and billing. Upgrade or renew subscription.
          </p>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current plans (admin-configured)</h2>
            <ul className="space-y-2 mb-6">
              {pricing.map((tier, i) => (
                <li key={i} className="flex justify-between text-gray-700">
                  <span>{tier.tier}</span>
                  <span className="font-semibold text-blue-600">{tier.currency} {tier.price}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 mb-6">Subscription status placeholder. Upgrade / Renew CTA.</p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Upgrade / Renew
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
