'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureContentProps {
  slug: string;
}

interface FeatureDetail {
  slug: string;
  title: string;
  icon: string;
  description: string;
  longDescription: string;
  keyFeatures: string[];
  useCases: string[];
  visualExample: {
    type: 'chart' | 'diagram' | 'screenshot';
    description: string;
  };
}

const featureDetails: Record<string, FeatureDetail> = {
  'advanced-data-visualization': {
    slug: 'advanced-data-visualization',
    title: 'Advanced Data Visualization',
    icon: '📊',
    description: 'Create stunning charts and graphs that bring your thesis data to life with interactive elements.',
    longDescription: 'Transform your raw research data into compelling visual narratives with our advanced visualization tools. Whether you need bar charts, line graphs, scatter plots, or heatmaps, ThesisAnalyzer provides a comprehensive suite of visualization options designed specifically for academic research.',
    keyFeatures: [
      'Interactive charts with zoom, pan, and filter capabilities',
      'Multiple chart types: bar, line, scatter, pie, heatmap, and more',
      'Customizable color schemes and themes',
      'Export visualizations in high-resolution formats (PNG, SVG, PDF)',
      'Real-time data updates in visualizations',
      'Responsive designs that work on all devices',
    ],
    useCases: [
      'Presenting research findings in thesis defense',
      'Creating publication-ready figures for academic papers',
      'Visualizing trends and patterns in longitudinal studies',
      'Comparing multiple datasets side-by-side',
      'Creating interactive dashboards for data exploration',
    ],
    visualExample: {
      type: 'chart',
      description: 'Example interactive bar chart showing research data trends over time',
    },
  },
  'deep-analysis-tools': {
    slug: 'deep-analysis-tools',
    title: 'Deep Analysis Tools',
    icon: '🔍',
    description: 'Uncover hidden patterns and insights in your research data with powerful analytical tools.',
    longDescription: 'Go beyond surface-level statistics with our comprehensive analysis toolkit. From descriptive statistics to advanced machine learning algorithms, ThesisAnalyzer provides everything you need to extract meaningful insights from your research data.',
    keyFeatures: [
      'Statistical analysis: mean, median, mode, standard deviation',
      'Correlation and regression analysis',
      'Hypothesis testing (t-tests, ANOVA, chi-square)',
      'Time series analysis and forecasting',
      'Clustering and classification algorithms',
      'Text analysis and sentiment detection',
    ],
    useCases: [
      'Identifying correlations between variables',
      'Testing research hypotheses statistically',
      'Discovering hidden patterns in large datasets',
      'Predictive modeling for future trends',
      'Categorizing and grouping research data',
    ],
    visualExample: {
      type: 'diagram',
      description: 'Analysis workflow diagram showing data processing pipeline',
    },
  },
  'lightning-fast-processing': {
    slug: 'lightning-fast-processing',
    title: 'Lightning Fast Processing',
    icon: '⚡',
    description: 'Process large datasets in seconds with our optimized algorithms and cloud infrastructure.',
    longDescription: 'Time is precious in research. Our optimized processing engine handles datasets of any size with remarkable speed, allowing you to focus on analysis rather than waiting for computations to complete.',
    keyFeatures: [
      'Parallel processing for multi-core performance',
      'Cloud-based infrastructure for scalability',
      'Optimized algorithms for common statistical operations',
      'Caching system for repeated analyses',
      'Batch processing for multiple datasets',
      'Real-time progress tracking',
    ],
    useCases: [
      'Processing large-scale survey data',
      'Analyzing genomic sequences',
      'Handling time-series data with millions of points',
      'Running complex statistical models',
      'Processing multiple datasets simultaneously',
    ],
    visualExample: {
      type: 'screenshot',
      description: 'Performance metrics showing processing speed comparison',
    },
  },
  'precision-accuracy': {
    slug: 'precision-accuracy',
    title: 'Precision & Accuracy',
    icon: '🎯',
    description: 'Ensure your thesis conclusions are backed by accurate statistical analysis and validation.',
    longDescription: 'Academic research demands precision. ThesisAnalyzer uses validated statistical methods and provides comprehensive error checking to ensure your analyses are accurate and reliable.',
    keyFeatures: [
      'Validated statistical algorithms',
      'Automatic error detection and warnings',
      'Confidence intervals and margin of error calculations',
      'Data validation and quality checks',
      'Reproducible analysis workflows',
      'Detailed audit trails for all calculations',
    ],
    useCases: [
      'Ensuring statistical significance in results',
      'Validating research methodology',
      'Meeting academic publication standards',
      'Reproducing analyses for peer review',
      'Maintaining data integrity throughout research',
    ],
    visualExample: {
      type: 'diagram',
      description: 'Accuracy validation workflow showing error checking process',
    },
  },
  'collaborative-workspace': {
    slug: 'collaborative-workspace',
    title: 'Collaborative Workspace',
    icon: '🤝',
    description: 'Work together with your research team in real-time on shared projects and analyses.',
    longDescription: 'Research is often a team effort. Our collaborative workspace enables seamless cooperation between researchers, advisors, and team members, with real-time updates and shared access to analyses.',
    keyFeatures: [
      'Real-time collaboration on projects',
      'Shared workspaces with role-based permissions',
      'Comment and annotation system',
      'Version control for analyses',
      'Activity feed showing team changes',
      'Direct messaging and notifications',
    ],
    useCases: [
      'Collaborating with research advisors',
      'Working with co-researchers on shared datasets',
      'Getting feedback on analysis approaches',
      'Sharing preliminary results with team',
      'Coordinating multi-person research projects',
    ],
    visualExample: {
      type: 'screenshot',
      description: 'Collaborative workspace interface showing team members and shared projects',
    },
  },
  'access-anywhere': {
    slug: 'access-anywhere',
    title: 'Access Anywhere',
    icon: '📱',
    description: 'Access your thesis analysis from any device, anywhere, with cloud synchronization.',
    longDescription: 'Your research shouldn\'t be tied to a single computer. Access your analyses from your laptop, tablet, or smartphone, with automatic cloud synchronization ensuring your work is always up-to-date.',
    keyFeatures: [
      'Cross-platform compatibility (Windows, Mac, Linux, iOS, Android)',
      'Automatic cloud synchronization',
      'Offline mode with sync when online',
      'Mobile-optimized interface',
      'Secure data encryption in transit and at rest',
      'Backup and recovery options',
    ],
    useCases: [
      'Working from multiple locations',
      'Accessing data during field research',
      'Reviewing analyses on mobile devices',
      'Presenting results from any device',
      'Continuing work across different computers',
    ],
    visualExample: {
      type: 'screenshot',
      description: 'Multi-device view showing synchronized access across platforms',
    },
  },
};

export default function FeatureContent({ slug }: FeatureContentProps) {
  const { isAuthenticated } = useAuth();
  // Normalize slug to handle any encoding issues
  const normalizedSlug = (slug || '').toLowerCase().trim();
  const feature = featureDetails[normalizedSlug];
  
  // Debug: Log available keys and received slug
  if (process.env.NODE_ENV === 'development') {
    console.log('FeatureContent - Received slug:', slug);
    console.log('FeatureContent - Normalized slug:', normalizedSlug);
    console.log('FeatureContent - Feature found:', !!feature);
    if (!feature) {
      console.log('FeatureContent - Available slugs:', Object.keys(featureDetails));
    }
  }

  if (!feature) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Feature Not Found</h1>
          <p className="text-gray-600 mb-8">
            The feature you&apos;re looking for doesn&apos;t exist. Slug received: &quot;{slug}&quot;
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Available features: {Object.keys(featureDetails).join(', ')}
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/#why-use" className="hover:text-blue-600">
              Features
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900 font-medium">{feature.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">{feature.icon}</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{feature.title}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{feature.longDescription}</p>
      </div>

      {/* Visual Example Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Visual Example</h2>
          <div className="bg-white rounded-lg p-8 shadow-md">
            {feature.visualExample.type === 'chart' && (
              <div className="space-y-4">
                <div className="h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600">Interactive Chart Visualization</p>
                    <p className="text-sm text-gray-500 mt-2">{feature.visualExample.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-blue-50 rounded p-4 text-center">
                      <div className="h-24 bg-blue-200 rounded mb-2" style={{ height: `${60 + i * 10}px` }}></div>
                      <p className="text-xs text-gray-600">Data {i}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {feature.visualExample.type === 'diagram' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-8">
                  <div className="bg-blue-100 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">📥</div>
                    <p className="text-sm font-semibold">Input</p>
                  </div>
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="bg-purple-100 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">⚙️</div>
                    <p className="text-sm font-semibold">Process</p>
                  </div>
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="bg-green-100 rounded-lg p-6 text-center">
                    <div className="text-2xl mb-2">📤</div>
                    <p className="text-sm font-semibold">Output</p>
                  </div>
                </div>
                <p className="text-center text-gray-600 mt-4">{feature.visualExample.description}</p>
              </div>
            )}
            {feature.visualExample.type === 'screenshot' && (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                  <div className="bg-white rounded shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-sm text-gray-500">ThesisAnalyzer</div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                      <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-100 rounded p-4">
                            <div className="h-20 bg-gray-200 rounded mb-2"></div>
                            <div className="h-2 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-gray-600">{feature.visualExample.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feature.keyFeatures.map((featureItem, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700">{featureItem}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feature.useCases.map((useCase, index) => (
            <div
              key={index}
              className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100"
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">✓</div>
                <p className="text-gray-700 font-medium">{useCase}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 md:p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-6 opacity-90">
          Experience {feature.title.toLowerCase()} with ThesisAnalyzer today
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link
                href="/analysis"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Analysis
              </Link>
              <Link
                href="/projects"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                View Projects
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/analysis"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Try Analysis
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Back to Features */}
      <div className="mt-12 text-center">
        <Link
          href="/#why-use"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to All Features</span>
        </Link>
      </div>
    </div>
  );
}

