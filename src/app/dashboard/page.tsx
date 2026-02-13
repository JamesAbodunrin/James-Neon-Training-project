import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Central workspace: entry to analysis, history, and billing.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
