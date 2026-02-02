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
    description: 'Linear, logistic, and polynomial regression modeling',
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
    description: 'K-means, hierarchical, and DBSCAN clustering algorithms',
    icon: '🎯',
  },
  {
    id: 'time-series',
    name: 'Time Series Analysis',
    description: 'Trend analysis, seasonality, and forecasting',
    icon: '⏰',
  },
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    description: 'Sentiment analysis, topic modeling, and NLP processing',
    icon: '📝',
  },
];

export default function AnalysisTypeSelector({
  selectedType,
  onSelect,
  className = '',
}: AnalysisTypeSelectorProps) {
  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Analysis Type</h2>
      <p className="text-gray-600 mb-6">Choose the type of analysis you want to perform on your data</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analysisTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedType === type.id
                ? 'border-blue-600 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="text-3xl mb-2">{type.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

