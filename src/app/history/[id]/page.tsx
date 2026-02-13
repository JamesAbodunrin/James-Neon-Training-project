import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface HistoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/history" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to History
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Snapshot Detail</h1>
          <p className="text-gray-600 mb-8">
            View stored outputs and re-download report. Snapshot ID: {id}
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-xl mx-auto">
            <p className="text-amber-800 font-medium mb-2">History detail requires backend</p>
            <p className="text-sm text-amber-700 mb-6">
              Snapshot loading and re-download will be available once the API and snapshot storage are connected. For now, run analyses from the Analysis page and download reports there.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/analysis"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Go to Analysis
              </Link>
              <Link
                href="/history"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                Back to History
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
