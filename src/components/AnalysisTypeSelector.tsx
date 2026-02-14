'use client';

import { useState, useEffect } from 'react';
import { isApiEnabled, apiGetToolsPublic } from '@/lib/api';

const STORAGE_TOOLS = 'thesisAnalyzer_adminTools';

interface AnalysisType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface AnalysisTypeSelectorProps {
  selectedType: string | null;
  onSelect: (typeId: string) => void;
  className?: string;
}

function getAdminToolEnabled(typeId: string): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const s = localStorage.getItem(STORAGE_TOOLS);
    if (!s) return true;
    const arr: { id: string; enabled: boolean }[] = JSON.parse(s);
    const row = arr.find((t) => t.id === typeId);
    return row == null ? true : row.enabled;
  } catch {
    return true;
  }
}

const analysisTypes: AnalysisType[] = [
  {
    id: 'statistical',
    name: 'Statistical Analysis',
    description: 'Descriptive statistics, hypothesis testing, and inferential analysis',
    icon: '📊',
  },
  {
    id: 'regression',
    name: 'Regression Analysis',
    description: 'Linear regression (Y on X): slope, intercept, R², and supporting analyses',
    icon: '📈',
  },
  {
    id: 'correlation',
    name: 'Correlation Analysis',
    description: 'Pearson, Spearman, and Kendall correlation coefficients',
    icon: '🔗',
  },
  {
    id: 'clustering',
    name: 'Clustering Analysis',
    description: 'K-means clustering on numeric variables with supporting descriptive stats',
    icon: '🎯',
  },
  {
    id: 'time-series',
    name: 'Time Series Analysis',
    description: 'Linear trend over time and supporting correlation/descriptive analyses',
    icon: '⏰',
  },
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    description: 'Word frequency and supporting descriptive analyses on text/categorical columns',
    icon: '📝',
  },
];

export default function AnalysisTypeSelector({
  selectedType,
  onSelect,
  className = '',
}: AnalysisTypeSelectorProps) {
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isApiEnabled()) {
      apiGetToolsPublic().then((list) => {
        if (list) {
          const disabled = new Set<string>();
          list.forEach((t) => {
            if (!t.enabled) disabled.add(t.id);
          });
          setDisabledIds(disabled);
        }
      });
      return;
    }
    const id = requestAnimationFrame(() => {
      const disabled = new Set<string>();
      analysisTypes.forEach((t) => {
        if (!getAdminToolEnabled(t.id)) disabled.add(t.id);
      });
      setDisabledIds(disabled);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Analysis Type</h2>
      <p className="text-gray-700 mb-6">Choose the type of analysis you want to perform on your data</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisTypes.map((type) => {
          const isDisabled = disabledIds.has(type.id);
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => !isDisabled && onSelect(type.id)}
              disabled={isDisabled}
              title={isDisabled ? 'This tool is currently disabled by admin.' : undefined}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isDisabled
                  ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed opacity-75'
                  : selectedType === type.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="text-3xl mb-2" aria-hidden="true">{type.icon}</div>
              <h3 className={`font-semibold mb-1 ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>{type.name}</h3>
              <p className="text-sm text-gray-700">{type.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

