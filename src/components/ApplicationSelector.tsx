interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  recommendedFor: string[];
}

interface ApplicationSelectorProps {
  selectedApplication: string | null;
  onSelect: (appId: string) => void;
  analysisType: string | null;
  className?: string;
}

const applications: Application[] = [
  {
    id: 'python',
    name: 'Python',
    description: 'Pandas, NumPy, SciPy, Scikit-learn for comprehensive data analysis',
    icon: '🐍',
    recommendedFor: ['statistical', 'regression', 'correlation', 'clustering', 'time-series'],
  },
  {
    id: 'r',
    name: 'R',
    description: 'Statistical computing and graphics with extensive packages',
    icon: '📊',
    recommendedFor: ['statistical', 'regression', 'correlation', 'time-series'],
  },
  {
    id: 'excel',
    name: 'Excel',
    description: 'Spreadsheet analysis with built-in statistical functions',
    icon: '📑',
    recommendedFor: ['statistical', 'correlation'],
  },
  {
    id: 'matlab',
    name: 'MATLAB',
    description: 'Numerical computing and advanced mathematical analysis',
    icon: '🔬',
    recommendedFor: ['regression', 'time-series', 'clustering'],
  },
  {
    id: 'spss',
    name: 'SPSS',
    description: 'Statistical analysis software for social sciences',
    icon: '📈',
    recommendedFor: ['statistical', 'regression', 'correlation'],
  },
  {
    id: 'nltk',
    name: 'NLTK/TextBlob',
    description: 'Natural language processing and text analysis',
    icon: '📝',
    recommendedFor: ['text-analysis'],
  },
];

export default function ApplicationSelector({
  selectedApplication,
  onSelect,
  analysisType,
  className = '',
}: ApplicationSelectorProps) {
  const recommendedApps = analysisType
    ? applications.filter((app) => app.recommendedFor.includes(analysisType))
    : applications;

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Application</h2>
      <p className="text-gray-700 mb-6">
        Choose the application or tool required for your thesis analysis
        {analysisType && (
          <span className="text-blue-600 font-medium ml-1">
            (Recommended for {analysisType.replace('-', ' ')})
          </span>
        )}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onSelect(app.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedApplication === app.id
                ? 'border-purple-600 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
            }`}
          >
            <div className="text-3xl mb-2">{app.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
            <p className="text-sm text-gray-700">{app.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

