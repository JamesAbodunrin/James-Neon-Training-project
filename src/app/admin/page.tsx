import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">System Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">
            Configure pricing, tools, view revenue. Admin only.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing configuration</h2>
              <p className="text-gray-600 text-sm mb-4">Configure pricing tiers.</p>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium cursor-not-allowed" disabled>
                Save Configuration
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Tool activation</h2>
              <p className="text-gray-600 text-sm mb-4">Toggle tools ON/OFF.</p>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium cursor-not-allowed" disabled>
                Save Configuration
              </button>
            </div>
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
