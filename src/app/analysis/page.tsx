'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalysisTypeSelector from '@/components/AnalysisTypeSelector';
import ApplicationSelector from '@/components/ApplicationSelector';
import AnalysisOptionsSelector from '@/components/AnalysisOptionsSelector';
import DataInput from '@/components/DataInput';
import AnalysisResults from '@/components/AnalysisResults';
import AnalysisErrorBoundary from '@/components/AnalysisErrorBoundary';
import { analyzeData, type RequestedAnalysis } from '@/utils/analysisEngine';

export default function AnalysisPage() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [requestedAnalyses, setRequestedAnalyses] = useState<RequestedAnalysis[]>([]);
  const [researchPurpose, setResearchPurpose] = useState('');
  const [inputData, setInputData] = useState('');

  const analysisResult = useMemo(() => {
    return analyzeData(inputData, selectedAnalysisType, selectedApplication, {
      requestedAnalyses: requestedAnalyses.length > 0 ? requestedAnalyses : undefined,
      researchPurpose: researchPurpose.trim() || undefined,
    });
  }, [inputData, selectedAnalysisType, selectedApplication, requestedAnalyses, researchPurpose]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-14 sm:pt-16 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Data Analysis
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl">
              Select your analysis type, choose the required application, and input your data to get instant analysis results.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/analysis/advanced"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span>Advanced Mode</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <span className="text-sm text-gray-600">(Python sandbox)</span>
            </div>
          </div>

          <div className="space-y-12">
            {/* Step 1: Analysis Type Selection */}
            <AnalysisTypeSelector
              selectedType={selectedAnalysisType}
              onSelect={setSelectedAnalysisType}
            />

            {/* Step 2: Application Selection */}
            <ApplicationSelector
              selectedApplication={selectedApplication}
              onSelect={setSelectedApplication}
              analysisType={selectedAnalysisType}
            />

            {/* Step 3: Choose analyses to run (only options valid for type + application) */}
            <AnalysisOptionsSelector
              selected={requestedAnalyses}
              onChange={setRequestedAnalyses}
              analysisType={selectedAnalysisType}
              application={selectedApplication}
            />

            {/* Step 4: Research purpose (optional) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Purpose of your research (optional)</h2>
              <p className="text-gray-700 mb-3">
                Define the purpose of your thesis or study so that interpretations can be toned to your research goals.
              </p>
              <textarea
                value={researchPurpose}
                onChange={(e) => setResearchPurpose(e.target.value)}
                placeholder="e.g. To assess gender balance in the community and ensure representation in the sample."
                className="w-full min-h-[100px] p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y text-gray-900 bg-white placeholder:text-gray-500"
                aria-label="Purpose of your research"
              />
            </div>

            {/* Step 5: Data Input */}
            <DataInput 
              onDataChange={setInputData} 
              selectedApplication={selectedApplication}
            />

            {/* Large dataset notice */}
            {inputData.length > 50_000 && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2" role="status">
                Large dataset — analysis may take a moment to update.
              </p>
            )}

            {/* Step 6: Live Analysis Results */}
            <AnalysisErrorBoundary>
              <AnalysisResults
                result={analysisResult}
                analysisType={selectedAnalysisType}
                application={selectedApplication}
              />
            </AnalysisErrorBoundary>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

