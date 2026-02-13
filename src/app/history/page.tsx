import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analysis History</h1>
          <p className="text-gray-600 mb-8">
            View past analysis snapshots. Stored outputs only; raw datasets are not retained.
          </p>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <p className="text-gray-700 mb-4">No analyses yet.</p>
            <p className="text-sm text-gray-600 mb-6">
              Complete an analysis to see snapshots here. Filters: date, tool, test type, project name.
            </p>
            <Link
              href="/analysis"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              New Analysis
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
