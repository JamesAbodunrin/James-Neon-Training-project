'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { isApiEnabled, apiGetPricingPublic, type PricingItem } from '@/lib/api';

const FALLBACK: PricingItem[] = [
  { tier: 'Personal (per session)', price: '9.99', currency: 'USD' },
  { tier: 'Researcher (monthly)', price: '29.99', currency: 'USD' },
  { tier: 'Institutional (per seat)', price: '199.00', currency: 'USD' },
];

export default function PaymentPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [pricing, setPricing] = useState<PricingItem[]>(FALLBACK);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Checkout</h1>
          <p className="text-gray-600 mb-8">
            Process per-session or subscription payment. Transparent pricing; session expires after report download for Personal accounts.
          </p>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a plan (admin-configured prices)</h2>
            <ul className="space-y-3 mb-6" role="listbox" aria-label="Select a plan">
              {pricing.map((tier, i) => (
                <li key={i}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedIndex === i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full flex justify-between items-center py-3 px-4 rounded-lg border-2 text-left transition-colors ${
                      selectedIndex === i
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{tier.tier}</span>
                    <span className="text-blue-600 font-semibold">{tier.currency} {tier.price}</span>
                    {selectedIndex === i && (
                      <span className="ml-2 text-blue-600" aria-hidden="true">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 mb-6">Payment integration placeholder. Complete payment to activate your plan.</p>
            <p className="text-sm text-gray-600 mb-6">
              This session expires after report download for Personal plan.
            </p>
            <button
              type="button"
              disabled={selectedIndex === null}
              onClick={() => router.push('/dashboard')}
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 enabled:hover:bg-blue-700"
            >
              Complete payment (go to Dashboard)
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
