'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalysisTypeSelector from '@/components/AnalysisTypeSelector';
import ApplicationSelector from '@/components/ApplicationSelector';
import DataInput from '@/components/DataInput';
import AnalysisResults from '@/components/AnalysisResults';
import { analyzeData } from '@/utils/analysisEngine';

export default function AnalysisPage() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [inputData, setInputData] = useState('');

  const analysisResult = useMemo(() => {
    return analyzeData(inputData, selectedAnalysisType, selectedApplication);
  }, [inputData, selectedAnalysisType, selectedApplication]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Data Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Select your analysis type, choose the required application, and input your data to get instant analysis results.
            </p>
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

            {/* Step 3: Data Input */}
            <DataInput 
              onDataChange={setInputData} 
              selectedApplication={selectedApplication}
            />

            {/* Step 4: Live Analysis Results */}
            <AnalysisResults
              result={analysisResult}
              analysisType={selectedAnalysisType}
              application={selectedApplication}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

