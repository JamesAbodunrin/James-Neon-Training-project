import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PricingPage() {
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
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal</h2>
              <p className="text-gray-600 mb-4">Per analysis session (1 dataset = 1 session)</p>
              <p className="text-3xl font-bold text-blue-600 mb-4">Pay per session</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>Upload dataset (≤20MB)</li>
                <li>Predefined statistical tests</li>
                <li>Automatic interpretation</li>
                <li>Download academic-ready report</li>
                <li>Session expires after report download</li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Choose Plan
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-600">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Researcher</h2>
              <p className="text-gray-600 mb-4">Per session or subscription (monthly/annual)</p>
              <p className="text-3xl font-bold text-blue-600 mb-4">Subscription</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>Multiple analyses</li>
                <li>Advanced tests</li>
                <li>Advanced Python Mode</li>
                <li>Save final outputs</li>
                <li>Unlimited during active period</li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Choose Plan
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Institutional</h2>
              <p className="text-gray-600 mb-4">Bulk license with seat limit</p>
              <p className="text-3xl font-bold text-blue-600 mb-4">Bulk license</p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li>Access for many students</li>
                <li>Usage monitoring</li>
                <li>Seat allocation management</li>
                <li>Configurable retention</li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
