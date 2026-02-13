import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Error / Session Expired</h1>
          <p className="text-gray-600 mb-8">
            Your session may have expired or payment failed. Please retry or go to payment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/payment"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Payment
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Retry
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
