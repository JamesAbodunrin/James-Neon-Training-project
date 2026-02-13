import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SubscriptionPage() {
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
