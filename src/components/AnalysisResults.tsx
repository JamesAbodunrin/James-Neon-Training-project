'use client';

import { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { AnalysisResult as AnalysisResultType } from '@/utils/analysisEngine';
import { buildDocxFromResult } from '@/utils/reportDocx';

interface AnalysisResultsProps {
  result: AnalysisResultType;
  analysisType: string | null;
  application: string | null;
  className?: string;
}

const CHART_COLORS = ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706', '#0891b2'];

export default function AnalysisResults({
  result,
  analysisType,
  application,
  className = '',
}: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  const [docLoading, setDocLoading] = useState(false);

  const formatResults = useCallback((): string => {
    let output = `THESIS ANALYSIS REPORT\n`;
    output += `=====================\n\n`;
    output += `Analysis Type: ${analysisType?.replace('-', ' ').toUpperCase() || 'N/A'}\n`;
    output += `Application: ${application?.toUpperCase() || 'N/A'}\n`;
    output += `Date: ${new Date().toLocaleDateString()}\n\n`;
    output += `Method: ${result.methodUsed}\n\n`;
    output += `SUMMARY\n-------\n${result.summary}\n\n`;
    if (Object.keys(result.statistics).length > 0) {
      output += `STATISTICS\n----------\n`;
      Object.entries(result.statistics).forEach(([key, value]) => {
        output += `${key}: ${value}\n`;
      });
      output += `\n`;
    }
    if (result.interpretation_json.academicParagraph) {
      output += `INTERPRETATION\n--------------\n${result.interpretation_json.academicParagraph}\n\n`;
    }
    if (result.hypothesisTesting.length > 0) {
      output += `HYPOTHESIS TESTING\n------------------\n`;
      result.hypothesisTesting.forEach((ht, i) => {
        output += `${i + 1}. ${ht.name}\n${ht.interpretation}\n\n`;
      });
    }
    if (result.insights.length > 0) {
      output += `INSIGHTS\n--------\n`;
      result.insights.forEach((insight, index) => {
        output += `${index + 1}. ${insight}\n`;
      });
      output += `\n`;
    }
    if (result.recommendations.length > 0) {
      output += `RECOMMENDATIONS\n---------------\n`;
      result.recommendations.forEach((rec, index) => {
        output += `${index + 1}. ${rec}\n`;
      });
    }
    return output;
  }, [result, analysisType, application]);

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

  const handleDownloadTxt = () => {
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

  const handleDownloadDoc = async () => {
    setDocLoading(true);
    try {
      const chartImages: ArrayBuffer[] = [];
      const chartEls = document.querySelectorAll<HTMLElement>('[data-chart-export]');
      for (let i = 0; i < chartEls.length; i++) {
        try {
          const dataUrl = await toPng(chartEls[i]!, { pixelRatio: 2, cacheBust: true });
          const res = await fetch(dataUrl);
          const buf = await res.arrayBuffer();
          chartImages.push(buf);
        } catch {
          // skip this chart if capture fails
        }
      }
      const blob = await buildDocxFromResult(result, analysisType, application, undefined, {
        chartImages: chartImages.length > 0 ? chartImages : undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thesis-analysis-report-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate .docx:', err);
    } finally {
      setDocLoading(false);
    }
  };

  const needsTypeAndApp = !analysisType || !application;
  const hasData =
    result.summary &&
    !result.summary.includes('No data provided') &&
    !result.summary.includes('Please select');

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            disabled={!hasData}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownloadTxt}
            disabled={!hasData}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Download (.txt)
          </button>
          <button
            onClick={handleDownloadDoc}
            disabled={!hasData || docLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {docLoading ? 'Generating…' : 'Download Report (.doc)'}
          </button>
        </div>
      </div>

      {needsTypeAndApp && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center" role="status" aria-live="polite">
          <p className="text-amber-800 font-medium mb-1">Select an analysis type and application above</p>
          <p className="text-amber-700 text-sm">Choose your analysis type and tool to see available analyses and run results here.</p>
        </section>
      )}

      <div className="space-y-6">
        {/* Method used */}
        {hasData && result.methodUsed && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Method of analysis</h3>
            <p className="text-gray-700">{result.methodUsed}</p>
          </section>
        )}

        {/* Summary — only when type and application are selected */}
        {!needsTypeAndApp && (
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{result.summary}</p>
          </section>
        )}

        {/* Data presentation (tables with sections) */}
        {result.tables.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data presentation</h3>
            <div className="space-y-6 overflow-x-auto">
              {result.tables.map((tbl, idx) => (
                <div key={idx}>
                  {idx === 0 || (result.tables[idx - 1]?.sectionNum !== tbl.sectionNum) ? (
                    <h4 className="text-base font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
                      {tbl.sectionLabel}
                    </h4>
                  ) : null}
                  <p className="text-sm font-medium text-gray-700 mb-2">{tbl.title}</p>
                  <table className="w-full border border-gray-300 rounded-lg overflow-hidden text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        {tbl.headers.map((h, i) => (
                          <th key={i} className="px-4 py-2 border-b border-gray-300 text-gray-900 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-gray-200 hover:bg-gray-50">
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-4 py-2 text-gray-800">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tbl.interpretation && (
                    <p className="mt-3 text-gray-700 text-sm leading-relaxed border-l-4 border-blue-200 pl-4">
                      {tbl.interpretation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Charts */}
        {result.chartData.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Charts & graphs</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {result.chartData.map((series, idx) => {
                const isPie = series.data.length <= 8 && series.data.every((d) => typeof d.value === 'number');
                const barData = series.data.map((d) => ({ name: d.label, value: Number(d.value) }));
                return (
                  <div key={idx} className="min-h-[280px]" data-chart-export>
                    <p className="text-sm font-medium text-gray-700 mb-2">{series.name}</p>
                    {isPie && barData.length <= 8 ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={barData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {barData.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill={CHART_COLORS[idx % CHART_COLORS.length]} name="Value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Statistics */}
        {Object.keys(result.statistics).length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(result.statistics).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">{key}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hypothesis testing */}
        {result.hypothesisTesting.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Hypothesis testing</h3>
            <div className="space-y-4">
              {result.hypothesisTesting.map((ht, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="font-semibold text-gray-900 mb-1">{ht.name}</p>
                  <p className="text-sm text-gray-600 mb-1">{ht.nullHypothesis}</p>
                  <p className="text-sm text-gray-600 mb-1">{ht.alternativeHypothesis}</p>
                  <p className="text-sm text-gray-700">
                    {ht.testStatistic} = {ht.statisticValue.toFixed(4)}; p-value = {ht.pValue.toFixed(4)}; α = {ht.alpha}
                  </p>
                  <p className="mt-2 text-gray-800">
                    <span className={ht.conclusion === 'reject' ? 'text-green-700 font-medium' : 'text-gray-700'}>
                      {ht.conclusion === 'reject' ? 'Reject' : 'Fail to reject'} H₀.
                    </span>{' '}
                    {ht.interpretation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interpretation (interpretation_json) */}
        {result.interpretation_json.academicParagraph && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Interpretation</h3>
            <p className="text-gray-700 leading-relaxed mb-3">{result.interpretation_json.academicParagraph}</p>
            {result.interpretation_json.significanceStatement && (
              <p className="text-gray-700 mb-2">{result.interpretation_json.significanceStatement}</p>
            )}
            {result.interpretation_json.effectSizeStatement && (
              <p className="text-gray-700">{result.interpretation_json.effectSizeStatement}</p>
            )}
            {result.interpretation_json.findings.length > 0 && (
              <ul className="mt-3 space-y-1 list-disc list-inside text-gray-700">
                {result.interpretation_json.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Key insights */}
        {result.insights.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key insights</h3>
            <ul className="space-y-2">
              {result.insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recommendations (context-aware from engine) */}
        {result.recommendations.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2">→</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
