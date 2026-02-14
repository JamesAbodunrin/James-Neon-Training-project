import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

/**
 * Institutional Admin Panel (SRS 5.1, UI/UX Screen List).
 * Purpose: Manage seats & monitor usage. Primary CTA: Assign Seat.
 * Requires backend for seat allocation and institution management.
 */
export default function InstitutionAdminPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Institutional Admin Panel</h1>
          <p className="text-gray-600 mb-8">
            Manage seats and monitor usage for your institution. Assign seats to users; capacity enforced per institution.
          </p>
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <p className="text-gray-700 mb-6">
              Seat allocation and institution management require backend (institutions, institution_seats). Use the primary CTA when connected.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                disabled
                title="Requires backend"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold opacity-75 cursor-not-allowed"
              >
                Assign Seat
              </button>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
