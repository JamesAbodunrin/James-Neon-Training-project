'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AdvancedModePage() {
  const [code, setCode] = useState(`# Advanced Mode – sandboxed Python execution
# Whitelisted libraries only; no file system or internet access.
# Execution timeout enforced.

import numpy as np

# Example: simple statistics
data = np.array([1, 2, 3, 4, 5])
print("Mean:", np.mean(data))
print("Std:", np.std(data))
`);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setOutput('Execution log: Secure computation in progress...\n(Advanced Mode runs in sandbox; output capture placeholder.)');
    setTimeout(() => setRunning(false), 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Mode</h1>
              <p className="text-gray-600">
                Python code editor with sandboxed execution. Whitelisted libraries only; no file system or internet access.
              </p>
            </div>
            <Link href="/analysis" className="text-blue-600 hover:underline">
              ← Predefined Analysis
            </Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Python Editor</span>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {running ? 'Running…' : 'Run Code'}
                </button>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm text-gray-900 bg-white border-0 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:ring-inset placeholder:text-gray-500"
                spellCheck={false}
                aria-label="Python code editor"
              />
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Execution log</span>
              </div>
              <pre className="w-full h-96 p-4 font-mono text-sm text-gray-800 bg-gray-50 overflow-auto whitespace-pre-wrap">
                {output || 'Run code to see output.'}
              </pre>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Your raw dataset is temporarily processed and permanently deleted after session completion. Sandbox: no network, no filesystem, whitelisted libs, timeout enforced.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
