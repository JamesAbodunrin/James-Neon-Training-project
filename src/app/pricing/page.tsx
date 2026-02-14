'use client';

import { useEffect, useState } from 'react';
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

function findTier(tiers: PricingItem[], key: 'Personal' | 'Researcher' | 'Institutional'): PricingItem | undefined {
  return tiers.find((t) => t.tier.includes(key));
}

const CARD_CONFIG = [
  {
    key: 'Personal' as const,
    title: 'Personal',
    subtitle: 'Per analysis session (1 dataset = 1 session)',
    features: [
      'Upload dataset (≤20MB)',
      'Predefined statistical tests',
      'Automatic interpretation',
      'Download academic-ready report',
      'Session expires after report download',
    ],
    cta: 'Choose Plan',
    highlighted: false,
  },
  {
    key: 'Researcher' as const,
    title: 'Researcher',
    subtitle: 'Per session or subscription (monthly/annual)',
    features: [
      'Multiple analyses',
      'Advanced tests',
      'Advanced Python Mode',
      'Save final outputs',
      'Unlimited during active period',
    ],
    cta: 'Choose Plan',
    highlighted: true,
  },
  {
    key: 'Institutional' as const,
    title: 'Institutional',
    subtitle: 'Bulk license with seat limit',
    features: [
      'Access for many students',
      'Usage monitoring',
      'Seat allocation management',
      'Configurable retention',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  const { isAuthenticated } = useAuth();
  const [tiers, setTiers] = useState<PricingItem[]>(FALLBACK);

  useEffect(() => {
    if (isApiEnabled()) {
      apiGetPricingPublic().then((list) => {
        if (Array.isArray(list) && list.length > 0) setTiers(list);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Pricing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your research needs. Transparent pricing, no hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CARD_CONFIG.map((card) => {
              const tier = findTier(tiers, card.key);
              const priceLabel = tier
                ? `${tier.currency} ${tier.price}`
                : card.key === 'Personal'
                  ? 'Pay per session'
                  : card.key === 'Researcher'
                    ? 'Subscription'
                    : 'Bulk license';
              return (
                <div
                  key={card.key}
                  className={`bg-white rounded-xl shadow-lg p-8 border ${card.highlighted ? 'border-2 border-blue-600' : 'border-gray-200'}`}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h2>
                  <p className="text-gray-600 mb-4">{card.subtitle}</p>
                  <p className="text-3xl font-bold text-blue-600 mb-4">{priceLabel}</p>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    {card.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <Link
                    href={isAuthenticated ? (card.key === 'Institutional' ? '/dashboard' : '/payment') : '/auth'}
                    className={`block w-full py-3 text-center rounded-lg font-semibold transition-colors ${card.key === 'Institutional' ? 'bg-gray-800 text-white hover:bg-gray-900' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {card.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
