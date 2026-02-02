'use client';

import { useState } from 'react';

interface AnalysisResult {
  summary: string;
  statistics: Record<string, string | number>;
  insights: string[];
  recommendations: string[];
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  analysisType: string | null;
  application: string | null;
  className?: string;
}

export default function AnalysisResults({
  result,
  analysisType,
  application,
  className = '',
}: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);

  const formatResults = (): string => {
    let output = `THESIS ANALYSIS REPORT\n`;
    output += `=====================\n\n`;
    output += `Analysis Type: ${analysisType?.replace('-', ' ').toUpperCase() || 'N/A'}\n`;
    output += `Application: ${application?.toUpperCase() || 'N/A'}\n`;
    output += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    output += `SUMMARY\n`;
    output += `-------\n`;
    output += `${result.summary}\n\n`;
    
    if (Object.keys(result.statistics).length > 0) {
      output += `STATISTICS\n`;
      output += `----------\n`;
      Object.entries(result.statistics).forEach(([key, value]) => {
        output += `${key}: ${value}\n`;
      });
      output += `\n`;
    }
    
    if (result.insights.length > 0) {
      output += `INSIGHTS\n`;
      output += `--------\n`;
      result.insights.forEach((insight, index) => {
        output += `${index + 1}. ${insight}\n`;
      });
      output += `\n`;
    }
    
    if (result.recommendations.length > 0) {
      output += `RECOMMENDATIONS\n`;
      output += `---------------\n`;
      result.recommendations.forEach((rec, index) => {
        output += `${index + 1}. ${rec}\n`;
      });
    }
    
    return output;
  };

  const handleCopy = async () => {
    const text = formatResults();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const text = formatResults();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thesis-analysis-${analysisType || 'report'}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-gray-200">
        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
          <p className="text-gray-700 leading-relaxed">{result.summary}</p>
        </div>

        {/* Statistics */}
        {Object.keys(result.statistics).length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(result.statistics).map(([key, value]) => (
                <div key={key} className="bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {result.insights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
            <ul className="space-y-2">
              {result.insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2">→</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

