'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isApiEnabled, apiGetHistory, type HistoryListItem } from '@/lib/api';

export default function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const [list, setList] = useState<HistoryListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isApiEnabled() || !isAuthenticated) {
      const tid = requestAnimationFrame(() => {
        setList(null);
        setError(null);
        setLoading(false);
      });
      return () => cancelAnimationFrame(tid);
    }
    const tid = requestAnimationFrame(() => {
      setError(null);
      setLoading(true);
    });
    apiGetHistory()
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch((err: unknown) => {
        setList([]);
        setError(err instanceof Error ? err.message : 'Failed to load history');
      })
      .finally(() => setLoading(false));
    return () => cancelAnimationFrame(tid);
  }, [isAuthenticated]);

  const showEmpty = !isApiEnabled() || list?.length === 0;
  const showList = isApiEnabled() && isAuthenticated && list && list.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analysis History</h1>
          <p className="text-gray-600 mb-8">
            View past analysis snapshots. Stored outputs only; raw datasets are not retained.
          </p>

          {isApiEnabled() && !isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
              <p className="text-amber-800 font-medium">Sign in to view your analysis history.</p>
              <Link href="/auth" className="inline-block mt-3 text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          )}

          {loading && isApiEnabled() && isAuthenticated && (
            <p className="text-gray-500 mb-6">Loading history…</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-medium" role="alert">
              {error}
            </div>
          )}

          {showList && (
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 text-sm">
                Filters: date, tool, test type, project name. Stored outputs only; raw datasets are not retained.
              </p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((snap) => (
                  <li
                    key={snap.id}
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 truncate">
                        {snap.title || snap.toolCode || 'Analysis snapshot'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {snap.toolCode && <span>{snap.toolCode}</span>}
                        {snap.testType && <span> · {snap.testType}</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(snap.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/history/${snap.id}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showEmpty && !loading && (
            <div className="space-y-6">
              <p className="text-gray-600 text-sm">
                Past analysis snapshots appear below. Filters: date, tool, test type, project name. Stored outputs only; raw datasets are not retained.
              </p>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <p className="text-gray-700 mb-4">No analyses yet.</p>
                <p className="text-sm text-gray-600 mb-6">
                  Complete an analysis to see snapshots here. Each snapshot card will show <strong>View Details</strong> to open stored outputs and re-download report.
                </p>
                <Link
                  href="/analysis"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  New Analysis
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
