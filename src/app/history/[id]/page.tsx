'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { isApiEnabled, apiGetHistoryDetail, apiDeleteHistory } from '@/lib/api';
import type { HistoryDetailItem } from '@/lib/api';

const API_URL = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL ?? '') : process.env.NEXT_PUBLIC_API_URL ?? '';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [snapshot, setSnapshot] = useState<HistoryDetailItem | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id || !isApiEnabled() || !isAuthenticated) {
      setSnapshot(isApiEnabled() && isAuthenticated && id ? null : undefined);
      setError(null);
      return;
    }
    setError(null);
    apiGetHistoryDetail(id)
      .then((data) => {
        setSnapshot(data && typeof data === 'object' ? data : null);
      })
      .catch((err: unknown) => {
        setSnapshot(null);
        setError(err instanceof Error ? err.message : 'Failed to load snapshot');
      });
  }, [id, isAuthenticated]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Delete this snapshot? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const ok = await apiDeleteHistory(id);
      if (ok) router.replace('/history');
    } finally {
      setDeleting(false);
    }
  };

  const loading = isApiEnabled() && isAuthenticated && snapshot === undefined && !error;
  const notFound = isApiEnabled() && isAuthenticated && snapshot === null && !error;
  const noBackend = !isApiEnabled() || !isAuthenticated;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/history" className="text-blue-600 hover:underline mb-6 inline-block">
            ← Back to History
          </Link>

          {loading && (
            <p className="text-gray-500">Loading snapshot…</p>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 font-medium" role="alert">
              {error}
            </div>
          )}

          {notFound && !error && (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Snapshot Not Found</h1>
              <p className="text-gray-600 mb-6">The snapshot may have been deleted or you don&apos;t have access to it.</p>
              <Link href="/history" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Back to History
              </Link>
            </>
          )}

          {noBackend && !loading && (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Snapshot Detail</h1>
              <p className="text-gray-600 mb-8">View stored outputs and re-download report. Snapshot ID: {id}</p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-xl mx-auto">
                <p className="text-amber-800 font-medium mb-2">History detail requires backend</p>
                <p className="text-sm text-amber-700 mb-6">
                  Set <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_API_URL</code> and sign in to load snapshots from the API.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button type="button" disabled className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold opacity-75 cursor-not-allowed text-center">
                    Re-download Report
                  </button>
                  <Link href="/analysis" className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
                    Go to Analysis
                  </Link>
                  <Link href="/history" className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
                    Back to History
                  </Link>
                </div>
              </div>
            </>
          )}

          {snapshot && !loading && (
            <>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {snapshot.title || snapshot.toolCode || 'Snapshot'}
              </h1>
              <p className="text-gray-600 mb-2">
                {snapshot.toolCode && <span>{snapshot.toolCode}</span>}
                {snapshot.testType && <span> · {snapshot.testType}</span>}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {new Date(snapshot.createdAt).toLocaleString()}
              </p>

              {snapshot.interpretationJson != null && typeof snapshot.interpretationJson === 'object' && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Interpretation</h2>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-gray-700 whitespace-pre-wrap">
                    {(() => {
                      const interp = snapshot.interpretationJson as Record<string, unknown> | null;
                      if (interp && typeof interp.academicParagraph === 'string') return interp.academicParagraph;
                      try {
                        return JSON.stringify(snapshot.interpretationJson, null, 2);
                      } catch {
                        return String(snapshot.interpretationJson);
                      }
                    })()}
                  </div>
                </section>
              )}

              {snapshot.outputsJson != null && typeof snapshot.outputsJson === 'object' && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Outputs</h2>
                  <pre className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-700 overflow-x-auto">
                    {(() => {
                      try {
                        return JSON.stringify(snapshot.outputsJson, null, 2);
                      } catch {
                        return String(snapshot.outputsJson);
                      }
                    })()}
                  </pre>
                </section>
              )}

              <div className="flex flex-wrap gap-4">
                {snapshot.reportDownloadUrl && API_URL && (
                  <a
                    href={`${API_URL}${snapshot.reportDownloadUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Re-download Report
                  </a>
                )}
                {(!snapshot.reportDownloadUrl || !API_URL) && (
                  <span className="inline-block px-6 py-3 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed" title="No report stored">
                    Re-download Report
                  </span>
                )}
                <Link href="/analysis" className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
                  New Analysis
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete snapshot'}
                </button>
                <Link href="/history" className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center">
                  Back to History
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
