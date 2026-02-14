'use client';

import { useEffect } from 'react';
import type { RequestedAnalysis } from '@/utils/analysisEngine';
import { getApplicableAnalyses } from '@/utils/analysisEngine';

export const ANALYSIS_OPTIONS: { id: RequestedAnalysis; label: string; description: string }[] = [
  { id: 'simple_percentage', label: 'Simple percentage', description: 'Frequency and % per category (e.g. demographic tables)' },
  { id: 'descriptive_mean', label: 'Descriptive statistics (mean, median, SD)', description: 'Mean, median, min, max, standard deviation' },
  { id: 'correlation', label: 'Correlation', description: 'Pearson correlation between two numeric variables' },
  { id: 't_test', label: 'Hypothesis: t-test', description: 'One-sample t-test (mean vs zero)' },
  { id: 'chi_square', label: 'Hypothesis: Chi-square', description: 'Chi-square test of independence (two categorical variables)' },
  { id: 'linear_regression', label: 'Linear regression', description: 'Simple linear regression (Y on X): slope, intercept, R², p-value' },
  { id: 'k_means_clustering', label: 'K-means clustering', description: 'K-means clustering on numeric variables (k = 2 or 3)' },
  { id: 'time_trend', label: 'Time-series trend', description: 'Linear trend over time (value regressed on time index)' },
  { id: 'word_frequency', label: 'Word frequency', description: 'Top 20 word frequencies from a text/categorical column' },
];

interface AnalysisOptionsSelectorProps {
  selected: RequestedAnalysis[];
  onChange: (selected: RequestedAnalysis[]) => void;
  analysisType: string | null;
  application: string | null;
  className?: string;
}

export default function AnalysisOptionsSelector({
  selected,
  onChange,
  analysisType,
  application,
  className = '',
}: AnalysisOptionsSelectorProps) {
  const applicable = getApplicableAnalyses(analysisType, application);

  useEffect(() => {
    if (!analysisType || !application) return;
    const allowed = getApplicableAnalyses(analysisType, application);
    const valid = selected.filter((s) => allowed.includes(s));
    if (valid.length !== selected.length) onChange(valid);
  }, [analysisType, application, selected, onChange]);

  const toggle = (id: RequestedAnalysis) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose analyses to run</h2>
      <p className="text-gray-700 mb-4">
        {applicable.length > 0
          ? 'Select the analyses you want. Only options that match your analysis type and application are shown.'
          : 'Select an analysis type and application above to see available analyses.'}
      </p>
      <div className="space-y-3">
        {ANALYSIS_OPTIONS.filter((opt) => applicable.includes(opt.id)).map((opt) => (
          <label
            key={opt.id}
            className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 bg-white cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.id)}
              onChange={() => toggle(opt.id)}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              aria-describedby={`${opt.id}-desc`}
            />
            <div>
              <span className="font-semibold text-gray-900">{opt.label}</span>
              <p id={`${opt.id}-desc`} className="text-sm text-gray-600 mt-0.5">
                {opt.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
